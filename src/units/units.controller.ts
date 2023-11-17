import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import mapRequestToResponse from '../shared/functions/map-request-to-response.function';
import { AdminToken } from '../auth/guards/admin-role.guard';
import { DbUnit } from './entities/unit.entity';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UseGuards(AdminToken)
  async create(@Body() createUnitDto: CreateUnitDto) {
    return await mapRequestToResponse<DbUnit>(
      this.unitsService,
      this.unitsService.create,
      createUnitDto,
    );
  }

  @Get()
  async findAll() {
    return await mapRequestToResponse<DbUnit[]>(
      this.unitsService,
      this.unitsService.findAll,
    );
  }

  @Patch()
  @UseGuards(AdminToken)
  async update(@Body() updateUnitDto: UpdateUnitDto) {
    return await mapRequestToResponse<DbUnit>(
      this.unitsService,
      this.unitsService.update,
      updateUnitDto,
    );
  }

  @Delete(':id')
  @UseGuards(AdminToken)
  async remove(@Param('id') id: string) {
    return await mapRequestToResponse<void>(
      this.unitsService,
      this.unitsService.remove,
      id,
    );
  }
}
