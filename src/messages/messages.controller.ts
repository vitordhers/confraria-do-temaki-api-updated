import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminToken } from '../auth/guards/admin-role.guard';
import mapPayloadToResponse from '../shared/functions/map-payload-to-response.function';
import mapRequestToResponse from '../shared/functions/map-request-to-response.function';
import CreateContactMessageDto from './dto/create-contact-message.dto';
import FranchisingContactDto from './dto/franchising-contact.dto';
import { UpdateReadAtDto } from './dto/update-lead-read-at.dto';
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
    @Query('start') start: string,
    @Query('size') size: string,
  ) {
    return mapRequestToResponse(
      this.messagesService,
      this.messagesService.getFranchisingLeads,
      +start,
      +size,
    );
  }

  @Get('messages')
  @UseGuards(AdminToken)
  async getMessageContacts(
    @Query('start') start: string,
    @Query('size') size: string,
  ) {
    return mapRequestToResponse(
      this.messagesService,
      this.messagesService.getMessageContacts,
      +start,
      +size,
    );
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
