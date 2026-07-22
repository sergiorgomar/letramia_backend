export type UploadedFile = {
  // Ruta/clave del archivo dentro del bucket (lo que hay que guardar en DB
  // si más adelante querés reconstruir la URL o borrar el archivo).
  path: string;
  url: string;
};

// Puerto que deben implementar todos los drivers de storage (Supabase, S3,
// GCS, ...). Los services de negocio dependen únicamente de esta interfaz,
// nunca de un SDK concreto.
export interface StorageProvider {
  upload(
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<UploadedFile>;
  remove(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}
