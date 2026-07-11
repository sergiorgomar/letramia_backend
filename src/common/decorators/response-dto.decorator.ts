import { SetMetadata } from '@nestjs/common';

export const RESPONSE_DTO_KEY = 'responseDto';

export interface ResponseDtoMeta {
  dto: new () => object;
  message: string;
}

export const ResponseDto = (dto: new () => object, message = 'OK') =>
  SetMetadata(RESPONSE_DTO_KEY, { dto, message } satisfies ResponseDtoMeta);
