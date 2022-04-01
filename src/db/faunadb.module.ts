import { Module } from "@nestjs/common";
import { FaunaDbService } from "./faunadb.service";

@Module({
  providers: [FaunaDbService],
  exports: [FaunaDbService]
})
export class DbModule {}
