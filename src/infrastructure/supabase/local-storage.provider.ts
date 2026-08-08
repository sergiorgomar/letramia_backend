import { Injectable } from '@nestjs/common';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve } from 'node:path';

const SIGNED_URL_TTL_SECONDS = 60 * 60;
type BucketType = 'public' | 'private';

export type SignedUrl = { url: string; expiresAt: Date };

@Injectable()
export class LocalStorageProvider {
  rootDirectory = join(process.cwd(), 'uploads');
  baseUrl = process.env.APP_URL ?? 'http://localhost:3000';

  constructor(private readonly bucketType: BucketType) {
    this.rootDirectory = join(process.cwd(), 'uploads', this.bucketType);
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
    return `${this.baseUrl.replace(/\/$/, '')}/uploads/${encodedPath}`;
  }

  async getSignedUrl(path: string): Promise<SignedUrl> {
    // Solo para desarrollo local: no hay firma real.
    return {
      url: this.getPublicUrl(path),
      expiresAt: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000),
    };
  }
}
