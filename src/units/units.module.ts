import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { DbModule } from '../db/firestore.module';

@Module({
  imports: [DbModule],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
