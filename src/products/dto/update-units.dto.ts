import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUnitsDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString({ each: true })
  unitsAvailable: string[];
}
