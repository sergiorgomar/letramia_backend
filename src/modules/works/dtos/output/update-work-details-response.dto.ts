import { IsUUID } from 'class-validator';

export class UpdateWorkDetailsResponseDto {
  @IsUUID()
  id: string;
}
