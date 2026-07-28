import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_PROVIDER } from '@/common/constants';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type SignedUrl = { url: string; expiresAt: Date };

@Injectable()
export class SupabaseStorageProvider {
  constructor(
    @Inject(SUPABASE_ADMIN_PROVIDER) private readonly supabase: SupabaseClient,
    private readonly bucket: string,
  ) {}

  async upload(path: string, file: Buffer, contentType: string) {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) {
      throw new Error(
        `No se pudo subir el archivo a Supabase Storage: ${error.message}`,
      );
    }
  }

  // Descarga el archivo como texto. Devuelve null si el objeto no existe,
  // para que el caller distinga "todavía no se subió" de un error real.
  async downloadText(path: string): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(path);

    if (error) {
      return null;
    }

    return data.text();
  }

  async remove(paths: string | string[]): Promise<void> {
    const objects = Array.isArray(paths) ? paths : [paths];
    if (objects.length === 0) return;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove(objects);

    if (error) {
      throw new Error(
        `No se pudo eliminar el archivo de Supabase Storage: ${error.message}`,
      );
    }
  }

  getPublicUrl(path: string): string {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return publicUrl;
  }

  async getSignedUrl(path: string): Promise<SignedUrl> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (error) {
      throw error;
    }

    return {
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000),
    };
  }
}
