// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
//   //GetObjectCommand,
// } from '@aws-sdk/client-s3';
// //import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// @Injectable()
// export class S3Provider {
//   private readonly s3Client: S3Client;
//   private readonly bucketName: string;

//   constructor(private readonly configService: ConfigService) {
//     this.s3Client = new S3Client({
//       region: this.configService.get<string>('AWS_REGION'),
//       credentials: {
//         accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
//         secretAccessKey: this.configService.get<string>(
//           'AWS_SECRET_ACCESS_KEY',
//         )!,
//       },
//     });
//     this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;
//   }

//   /**
//    * Uploads a raw file buffer to the configured S3 Bucket.
//    * @param fileBuffer The raw binary Buffer of the file (e.g., from Multer `file.buffer`).
//    * @param fileName The unique destination path and name inside the bucket (e.g., 'invoices/2026-06-04_inv.pdf').
//    * @param mimeType The standard MIME type of the file (e.g., 'application/pdf', 'image/jpeg').
//    * @returns An object containing the asset's direct URL and its unique S3 Key.
//    * * @example
//    * const { url, key } = await this.s3Provider.uploadFile(
//    * file.buffer,
//    * 'avatars/user-99.png',
//    * 'image/png'
//    * );
//    */
//   async uploadFile(
//     fileBuffer: Buffer,
//     fileName: string,
//     mimeType: string,
//   ): Promise<{ url: string; key: string }> {
//     const command = new PutObjectCommand({
//       Bucket: this.bucketName,
//       Key: fileName,
//       Body: fileBuffer,
//       ContentType: mimeType,
//       // ACL: 'public-read',
//     });

//     try {
//       await this.s3Client.send(command);
//       const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
//       return {
//         url,
//         key: fileName,
//       };
//     } catch {
//       throw new InternalServerErrorException(`Failed to upload file to S3`);
//     }
//   }

//   /**
//    * Deletes an object from the S3 Bucket using its unique Key identifier.
//    * * @param fileName The exact S3 Key path of the file to remove (e.g., 'invoices/2026-06-04_inv.pdf').
//    * @returns A success confirmation message object.
//    * * @example
//    * await this.s3Provider.deleteFile('avatars/user-99.png');
//    */
//   async deleteFile(
//     fileName: string,
//   ): Promise<{ success: boolean; message: string }> {
//     const command = new DeleteObjectCommand({
//       Bucket: this.bucketName,
//       Key: fileName,
//     });

//     try {
//       await this.s3Client.send(command);
//       return {
//         success: true,
//         message: `Asset '${fileName}' successfully deleted from S3 bucket.`,
//       };
//     } catch {
//       throw new InternalServerErrorException(`Failed to delete file from S3`);
//     }
//   }

//   /**
//    * Generates a temporary secure URL (Presigned URL) to read/download a private object.
//    * Highly recommended if your S3 bucket blocks public access by default.
//    * * @param fileName The exact S3 Key path of the file.
//    * @param expiresIn Seconds until the link expires. Defaults to 3600 (1 Hour).
//    * @returns A temporary signed URL string.
//    * * @example
//    * const secureUrl = await this.s3Provider.getPresignedUrl('secure-docs/contract.pdf', 1800); // Expires in 30 mins
//    */
//   // async getPresignedUrl(fileName: string, expiresIn = 3600): Promise<string> {
//   //   const command = new GetObjectCommand({
//   //     Bucket: this.bucketName,
//   //     Key: fileName,
//   //   });

//   //   try {
//   //     // Generates a signed URL that bypasses the bucket privacy settings until it expires
//   //     return await getSignedUrl(this.s3Client, command, { expiresIn });
//   //   } catch (error) {
//   //     throw new InternalServerErrorException(`Failed to generate S3 presigned URL: ${error.message}`);
//   //   }
//   // }
// }
