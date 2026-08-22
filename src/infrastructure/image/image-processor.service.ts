import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export type ImageVariantName =
  'mini_thumb' | 'thumb' | 'small' | 'medium' | 'large';

interface VariantConfig {
  width: number;
  quality: number;
}

// Todas las variantes se generan como WebP. Sharp descarta metadata
// (EXIF, GPS, ICC, etc.) por defecto salvo que se llame a withMetadata().
const VARIANTS: Record<ImageVariantName, VariantConfig> = {
  mini_thumb: { width: 80, quality: 60 },
  thumb: { width: 150, quality: 60 },
  small: { width: 400, quality: 70 },
  medium: { width: 800, quality: 78 },
  large: { width: 1600, quality: 85 },
};

export const IMAGE_VARIANT_NAMES = Object.keys(VARIANTS) as ImageVariantName[];

export interface ImageVariant {
  buffer: Buffer;
  contentType: 'image/webp';
  extension: 'webp';
}

export interface ContentImage {
  buffer: Buffer;
  contentType: 'image/webp';
  extension: 'webp';
}

@Injectable()
export class ImageProcessorService {
  COVER_MIN_ASPECT_RATIO = 0.6;
  COVER_MAX_ASPECT_RATIO = 0.8;
  COVER_ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
  CONTENT_IMAGE_ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);
  CONTENT_IMAGE_ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp']);
  CONTENT_IMAGE_MAX_DIMENSION = 4_000;

  async getDimensions(
    input: Buffer,
  ): Promise<{ width: number; height: number }> {
    const { width, height } = await sharp(input).metadata();
    if (!width || !height) {
      throw new Error('No se pudieron leer las dimensiones de la imagen');
    }
    return { width, height };
  }

  async getAspectRatio(input: Buffer): Promise<number> {
    const { width, height } = await this.getDimensions(input);
    return width / height;
  }

  async generateCoverVariants(
    input: Buffer,
  ): Promise<Record<ImageVariantName, ImageVariant>> {
    const entries = await Promise.all(
      IMAGE_VARIANT_NAMES.map(async (name) => {
        const { width, quality } = VARIANTS[name];
        const buffer = await sharp(input)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality })
          .toBuffer();

        const variant: ImageVariant = {
          buffer,
          contentType: 'image/webp',
          extension: 'webp',
        };
        return [name, variant] as const;
      }),
    );

    return Object.fromEntries(entries) as Record<
      ImageVariantName,
      ImageVariant
    >;
  }

  isValidWorkCoverAspectRatio(aspectRatio: number): boolean {
    return (
      aspectRatio <= this.COVER_MIN_ASPECT_RATIO ||
      aspectRatio >= this.COVER_MAX_ASPECT_RATIO
    );
  }

  isValidWorkCoverMimeType(mimetype: string): boolean {
    return this.COVER_ALLOWED_MIME_TYPES.has(mimetype);
  }

  async generateContentImage(input: Buffer): Promise<ContentImage> {
    const metadata = await sharp(input, {
      limitInputPixels: this.CONTENT_IMAGE_MAX_DIMENSION ** 2,
    }).metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      !metadata.format ||
      !this.CONTENT_IMAGE_ALLOWED_FORMATS.has(metadata.format) ||
      metadata.width > this.CONTENT_IMAGE_MAX_DIMENSION ||
      metadata.height > this.CONTENT_IMAGE_MAX_DIMENSION
    ) {
      // 🔥 todo: aqui no se estan cacheando bien errores
      throw new Error('La imagen de contenido no cumple los requisitos');
    }

    const buffer = await sharp(input, {
      limitInputPixels: this.CONTENT_IMAGE_MAX_DIMENSION ** 2,
    })
      .rotate()
      .resize({
        width: 1_600,
        height: 1_600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    return { buffer, contentType: 'image/webp', extension: 'webp' };
  }

  isValidContentImageMimeType(mimetype: string): boolean {
    return this.CONTENT_IMAGE_ALLOWED_MIME_TYPES.has(mimetype);
  }
}
