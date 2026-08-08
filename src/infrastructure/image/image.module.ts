import { Global, Module } from '@nestjs/common';
import { ImageProcessorService } from './image-processor.service';

// 🔥 TODO: this functions can be just UTILS
@Global()
@Module({
  providers: [ImageProcessorService],
  exports: [ImageProcessorService],
})
export class ImageModule {}
