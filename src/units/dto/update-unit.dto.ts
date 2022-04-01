import { PartialType } from '@nestjs/mapped-types';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { CreateUnitDto } from './create-unit.dto';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;
}
