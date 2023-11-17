import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/firestore.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
