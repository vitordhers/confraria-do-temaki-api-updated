import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { DbUnit } from './entities/unit.entity';
import { v4 as uuid } from 'uuid';
import { FirestoreService } from '../db/firestore.service';
import { Collection } from '../db/collection.enum';
import { inspect } from 'util';

@Injectable()
export class UnitsService {
  private logger = new Logger('UnitsService');
  constructor(private firestoreService: FirestoreService) {}

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

    try {
      const result = await this.firestoreService.create(
        Collection.UNITS,
        newUnit,
      );

      return this.firestoreService.parseFirebaseResult(
        Collection.UNITS,
        result,
      ) as DbUnit;
    } catch (error) {
      this.logger.error(`create error ${inspect({ error }, { depth: null })}`);
    }
  }

  async findAll() {
    try {
      const result = await this.firestoreService.get(Collection.UNITS);
      const parsedResults = this.firestoreService.parseFirebaseResult(
        Collection.UNITS,
        result,
      ) as DbUnit[] | DbUnit;
      if (Array.isArray(parsedResults)) {
        [...parsedResults];
      }
      return [parsedResults];
    } catch (error) {
      this.logger.error(`findAll error ${inspect({ error }, { depth: null })}`);

      return [];
    }
  }

  async update(updateUnitDto: UpdateUnitDto) {
    try {
      const { id } = updateUnitDto;
      const result = (await this.firestoreService.update(
        Collection.UNITS,
        id,
        updateUnitDto,
      )) as DbUnit;

      return result;
    } catch (error) {
      this.logger.error(`update error ${inspect({ error }, { depth: null })}`);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.firestoreService.delete(Collection.UNITS, id);

      if (!result) {
        throw new BadRequestException(`delete failed ${result}`);
      }
    } catch (error) {
      this.logger.error(`update error ${inspect({ error }, { depth: null })}`);
    }
  }
}
