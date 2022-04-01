import { IsDateString, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class UpdateReadAtDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  readAt: string;
}
