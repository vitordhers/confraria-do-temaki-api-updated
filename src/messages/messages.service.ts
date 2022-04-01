import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import FranchisingContactDto from './dto/franchising-contact.dto';
import { ConfigService } from '@nestjs/config';
import { DbFranchisingLead } from './entities/db-franchising-lead.entity';
import { v4 as uuid } from 'uuid';
import { FaunaDbService } from 'src/db/faunadb.service';
import {
  Collection,
  Create,
  Documents,
  Get,
  Index,
  Lambda,
  Map,
  Match,
  Paginate,
  Select,
  Update,
} from 'faunadb';
import { UpdateReadAtDto } from './dto/update-lead-read-at.dto';
import CreateContactMessageDto from './dto/create-contact-message.dto';
import { DbMessageContact } from './entities/db-message-contact.entity';

@Injectable()
export class MessagesService {
  private transporter: Transporter;

  constructor(
    private configService: ConfigService,
    private dbService: FaunaDbService,
  ) {
    this.transporter = createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get('MAIL_ACCOUNT'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async createFranchisingLead(franchisingContactDto: FranchisingContactDto) {
    const {
      name,
      email,
      celphone,
      telephone,
      city,
      state,
      investment,
      reference,
      message,
    } = franchisingContactDto;

    const newFranchisingLead: DbFranchisingLead = {
      id: uuid(),
      name,
      email,
      celphone,
      telephone,
      city,
      state,
      investment,
      reference,
      message,
      sentAt: new Date(),
      readAt: null,
    };

    const result = (await this.dbService.query<DbFranchisingLead>(
      Create(Collection('leads'), {
        data: newFranchisingLead,
      }),
    )) as DbFranchisingLead;

    if (result) {
      return true;
      //   return await this.sendFranchisingEmail(newFranchisingLead);
    }
  }

  async createContactMessage(createMessageContactDto: CreateContactMessageDto) {
    const { name, email, message } = createMessageContactDto;

    const newMessageContactDto: DbMessageContact = {
      id: uuid(),
      name,
      email,
      message,
      sentAt: new Date(),
      readAt: null,
    };

    const result = (await this.dbService.query<DbMessageContact>(
      Create(Collection('messages'), {
        data: newMessageContactDto,
      }),
    )) as DbMessageContact;

    if (result) {
      return true;
      // return await this.sendFranchisingEmail(newFranchisingLead);
    }
  }

  async getFranchisingLeads(start = 0, size = 10) {
    const result = (await this.dbService.query<DbFranchisingLead[]>(
      Map(
        Paginate(
          Documents(Collection('leads')),
          size && start ? { size, start } : null,
        ),
        Lambda((x) => Get(x)),
      ),
    )) as DbFranchisingLead[];
    if (result) {
      return result;
    }
    return [];
  }

  async getMessageContacts(start = 0, size = 10) {
    const result = (await this.dbService.query<DbMessageContact[]>(
      Map(
        Paginate(
          Documents(Collection('messages')),
          size && start ? { size, start } : null,
        ),
        Lambda((x) => Get(x)),
      ),
    )) as DbMessageContact[];
    if (result) {
      return result;
    }
    return [];
  }

  async sendFranchisingEmail(franchisingLead: DbFranchisingLead) {
    this.transporter.verify((error, _) => {
      if (error) {
        console.log(error);
      }
    });
    const html = this.leadToHtml(franchisingLead);

    const result = await this.transporter.sendMail({
      from: '"Vitor" <vitor@cannislabs.com>',
      to: 'rhudner@gmail.com',
      subject:
        '😄 Você recebeu uma nova mensagem para Franqueamento da Confraria do Temaki!',
      html,
    });

    return result.accepted.length === 1;
  }

  leadToHtml(franchisingContactDto: DbFranchisingLead): string {
    const {
      id,
      name,
      email,
      telephone,
      city,
      state,
      investment,
      reference,
      message,
    } = franchisingContactDto;

    const html = `
    Prezado Rhudner,
    <br>
    você recebeu uma mensagem referente a um contato para Franqueamento da Confraria do Temaki.
    <br>
    Seguem abaio as informações do Interessado:
    <br>
    <table>
      <tr>
        <td>Nome</td>
        <td>${name}</td>
      </tr>
      <tr>
        <td>Id de referência no Banco de Dados</td>
        <td>${id}</td>
      </tr>
      <tr>
        <td>E-mail</td>
        <td>${email}</td>
      </tr>
      <tr>
        <td>Telefone</td>
        <td>${telephone}</td>
      </tr>
      <tr>
        <td>Cidade</td>
        <td>${city}</td>
      </tr>
      <tr>
        <td>Estado</td>
        <td>${state}</td>
      </tr>
      <tr>
        <td>Disposição de Investimento</td>
        <td>
        ${investment}
        <td>
      </tr>
      <tr>
        <td>
          O interessado também disse que conheceu a Confraria da seguinte maneira
        </td>
        <td>
          ${reference}
        </td>
      </tr>
      <tr>
        <td>
          Ele também redigiu a seguinte mensagem
        </td>
        <td>
          ${message}
        </td>
      </tr>
    </table>
    <br>
    <p>
      Espero que essa seja uma boa parceria e que você consiga fechar negócio. 😃
      Abraço!
    </p>`;
    return html;
  }

  async updateLeadReatAt(updateLeadReadAt: UpdateReadAtDto) {
    const result = await this.dbService.query<DbFranchisingLead>(
      Update(
        Select(['ref'], Get(Match(Index('lead_by_id'), updateLeadReadAt.id))),
        {
          data: updateLeadReadAt,
        },
      ),
    );

    return result;
  }

  async updateMessageReatAt(updateMessageReadAt: UpdateReadAtDto) {
    const result = await this.dbService.query<DbMessageContact>(
      Update(
        Select(
          ['ref'],
          Get(Match(Index('message_by_id'), updateMessageReadAt.id)),
        ),
        {
          data: updateMessageReadAt,
        },
      ),
    );

    return result;
  }
}
