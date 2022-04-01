import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Collection,
  Create,
  Get,
  Ref,
  Map,
  Paginate,
  Match,
  Index,
  Lambda,
  Documents,
  Update,
  Select,
  Delete,
} from 'faunadb';
import { FaunaDbService } from '../db/faunadb.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { DbUnit } from './entities/unit.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UnitsService {
  constructor(private dbService: FaunaDbService) {}
  async create(createUnitDto: CreateUnitDto) {
    const {
      name,
      location,
      address,
      telephone,
      workingHours,
      lat,
      lng,
      whatsapp,
    } = createUnitDto;
    const newUnit: DbUnit = {
      id: uuid(),
      name,
      location,
      address,
      telephone,
      workingHours,
      lat,
      lng,
      whatsapp,
    };
    return (await this.dbService.query<DbUnit>(
      Create(Collection('units'), {
        data: newUnit,
      }),
    )) as DbUnit;
  }

  async findAll() {
    const result = (await this.dbService.query<DbUnit>(
      Map(
        Paginate(Documents(Collection('units'))),
        Lambda((x) => Get(x)),
      ),
    )) as DbUnit[];
    if (result) {
      return result;
    }
    return [];
  }

  async update(updateUnitDto: UpdateUnitDto) {
    const result = (await this.dbService.query<DbUnit>(
      Update(
        Select(['ref'], Get(Match(Index('unit_by_id'), updateUnitDto.id))),
        {
          data: updateUnitDto,
        },
      ),
    )) as DbUnit;
    if (!result) {
      throw new BadRequestException(
        `Unit with id ${updateUnitDto.id} couldn't be deleted`,
      );
    }
    return result;
  }

  async remove(id: string) {
    const result = (await this.dbService.query<DbUnit>(
      Delete(Select(['ref'], Get(Match(Index('unit_by_id'), id)))),
    )) as DbUnit;
    if (!result) {
      throw new BadRequestException(`User with id ${id} couldn't be deleted`);
    }
    return;
  }
}
