import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');

  // ============= cors =============
  const configService = app.get(ConfigService);
  const allowedOrigins = (configService.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(String(origin))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // To catch all exceptions and wrap in standardized response
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Wraps successful responses in APIResponseDTO and validates them against
  // the DTO declared with @ResponseDto() on each route
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  // to handle dtos validations of input (nest decorators)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
