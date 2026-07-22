import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_PROVIDER } from '@/common/constants';
import { StorageProvider, UploadedFile } from './storage-provider.interface';

@Injectable()
export class SupabaseStorageProvider implements StorageProvider {
  private readonly bucket: string;

  constructor(
    @Inject(SUPABASE_ADMIN_PROVIDER) private readonly supabase: SupabaseClient,
    configService: ConfigService,
  ) {
    this.bucket = configService.get<string>('SUPABASE_STORAGE_BUCKET')!;
  }

  async upload(
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<UploadedFile> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) {
      throw new Error(
        `No se pudo subir el archivo a Supabase Storage: ${error.message}`,
      );
    }

    return { path, url: this.getPublicUrl(path) };
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
}
