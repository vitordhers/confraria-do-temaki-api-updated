import { PartialType } from '@nestjs/mapped-types';
import { IsDefined, IsEmpty, IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsEmpty()
  override password: string;
}
