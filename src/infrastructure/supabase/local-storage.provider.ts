import { Injectable } from '@nestjs/common';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';

const SIGNED_URL_TTL_SECONDS = 60 * 60;
type BucketType = 'public' | 'private';

export type SignedUrl = { url: string; expiresAt: Date };

@Injectable()
export class LocalStorageProvider {
  rootDirectory = join(process.cwd(), 'uploads');
  publicBucketUrl = '';

  constructor(
    private readonly bucketType: BucketType,
    private readonly config: ConfigService,
  ) {
    this.rootDirectory = join(process.cwd(), 'uploads', this.bucketType);
    this.publicBucketUrl = this.config.get<string>('PUBLIC_BUCKET_URL')!;
  }

  private resolvePath(objectPath: string): string {
    const safePath = normalize(objectPath).replace(/^[/\\]+/, '');

    if (safePath === '..' || safePath.startsWith(`..${join('/')}`)) {
      throw new Error('Ruta de archivo inválida');
    }

    const destination = resolve(this.rootDirectory, safePath);
    const root = resolve(this.rootDirectory);

    if (!destination.startsWith(`${root}/`)) {
      throw new Error('Ruta de archivo inválida');
    }

    return destination;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upload(path: string, file: Buffer, _contentType: string) {
    const destination = this.resolvePath(path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file);
  }

  async downloadText(path: string): Promise<string | null> {
    try {
      return await readFile(this.resolvePath(path), 'utf8');
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async remove(paths: string | string[]): Promise<void> {
    await Promise.all(
      (Array.isArray(paths) ? paths : [paths]).map(async (path) => {
        try {
          await rm(this.resolvePath(path));
        } catch (error: unknown) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
      }),
    );
  }

  getPublicUrl(path: string): string {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const publicBucketUrl = this.config.get<string>('PUBLIC_BUCKET_URL');
    if (this.bucketType === 'public' && publicBucketUrl) {
      return `${publicBucketUrl.replace(/\/$/, '')}/${encodedPath}`;
    }
    return `${this.publicBucketUrl.replace(/\/$/, '')}/uploads/${this.bucketType}/${encodedPath}`;
  }

  async getSignedUrl(path: string): Promise<SignedUrl> {
    // Solo para desarrollo local: no hay firma real.
    return {
      url: this.getPublicUrl(path),
      expiresAt: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000),
    };
  }
}
