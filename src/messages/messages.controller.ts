import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AdminToken } from '../auth/guards/admin-role.guard';
import mapPayloadToResponse from '../shared/functions/map-payload-to-response.function';
import mapRequestToResponse from '../shared/functions/map-request-to-response.function';
import CreateContactMessageDto from './dto/create-contact-message.dto';
import FranchisingContactDto from './dto/franchising-contact.dto';
import { UpdateReadAtDto } from './dto/update-lead-read-at.dto';
import { DbFranchisingLead } from './entities/db-franchising-lead.entity';
import { DbMessageContact } from './entities/db-message-contact.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('lead')
  async createFranchisingLead(
    @Body() franchisingContactDto: FranchisingContactDto,
  ) {
    const success = await this.messagesService.createFranchisingLead(
      franchisingContactDto,
    );
    return mapPayloadToResponse<null>(success);
  }

  @Post('message')
  async createContactMessage(
    @Body() createContactMessageDto: CreateContactMessageDto,
  ) {
    const success = await this.messagesService.createContactMessage(
      createContactMessageDto,
    );
    return mapPayloadToResponse<null>(success);
  }

  @Get('leads')
  @UseGuards(AdminToken)
  async getFranchisingLeads(
    @Query('start') after: string,
    @Query('size') size: string,
  ) {
    if (!size) {
      throw new BadRequestException('Size is required');
    }
    return await mapRequestToResponse<DbFranchisingLead[]>(
      this.messagesService,
      this.messagesService.getFranchisingLeads,
      {
        start: +after || null,
        size: +size,
      },
    );
  }

  @Get('messages')
  @UseGuards(AdminToken)
  async getMessageContacts(
    @Query('after') after: string,
    @Query('size') size: string,
  ) {
    if (!size) {
      throw new BadRequestException('Size is required');
    }
    return await mapRequestToResponse<DbMessageContact[]>(
      this.messagesService,
      this.messagesService.getMessageContacts,
      {
        after: +after || null,
        size: +size || 20,
      },
    );
  }

  @Get('new')
  @UseGuards(AdminToken)
  async getNewLeadsAndMessages() {
    return await mapRequestToResponse<{
      newLeads: number;
      newMessages: number;
    }>(this.messagesService, this.messagesService.getNewLeadsAndMessages);
  }

  @Put('lead')
  @UseGuards(AdminToken)
  async updateFranchisingLead(@Body() updateLeadReatAtDto: UpdateReadAtDto) {
    return mapRequestToResponse(
      this.messagesService,
      this.messagesService.updateLeadReatAt,
      updateLeadReatAtDto,
    );
  }

  @Put('message')
  @UseGuards(AdminToken)
  async updateContactMessage(@Body() updateMessageReatAtDto: UpdateReadAtDto) {
    return mapRequestToResponse(
      this.messagesService,
      this.messagesService.updateMessageReatAt,
      updateMessageReatAtDto,
    );
  }
}
