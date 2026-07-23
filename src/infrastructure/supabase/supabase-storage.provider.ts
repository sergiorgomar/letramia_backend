import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_PROVIDER } from '@/common/constants';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type SignedUrl = { url: string; expiresAt: Date };

@Injectable()
export class SupabaseStorageProvider {
  private readonly bucket: string;

  constructor(
    @Inject(SUPABASE_ADMIN_PROVIDER) private readonly supabase: SupabaseClient,
    configService: ConfigService,
  ) {
    this.bucket = configService.get<string>('SUPABASE_STORAGE_BUCKET')!;
  }

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

  async remove(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);

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
