import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import FranchisingContactDto from './dto/franchising-contact.dto';
import { ConfigService } from '@nestjs/config';
import { DbFranchisingLead } from './entities/db-franchising-lead.entity';
import { v4 as uuid } from 'uuid';
import { FaunaDbService } from 'src/db/faunadb.service';
import {
  Collection,
  ContainsField,
  Create,
  Documents,
  Get,
  If,
  Index,
  Lambda,
  Map,
  Match,
  Paginate,
  Select,
  Sum,
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
      sentAt: Math.round(Date.now() / 1000),
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
      sentAt: Math.round(Date.now() / 1000),
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

  async getFranchisingLeads({ after, size }: { after?: number; size: number }) {
    const result = await this.dbService.query<DbFranchisingLead[]>(
      Map(
        Paginate(
          Match(Index('leads_sort_by_sentAt_desc')),
          after ? { size, after } : { size },
        ),
        Lambda((x, ref) =>
          Select(['data'], Match(Index('leads_sort_by_sentAt_desc')), Get(ref)),
        ),
      ),
    );

    if (result) {
      if (after) {
        result.shift();
      }
      return result;
    }
    return [];
  }

  async getMessageContacts({ after, size }: { after?: number; size: number }) {
    const result = (await this.dbService.query<DbMessageContact[]>(
      Map(
        Paginate(
          Match(Index('messages_sort_by_sentAt_desc')),
          after ? { size, after } : { size },
        ),
        Lambda((x, ref) =>
          Select(
            ['data'],
            Match(Index('messages_sort_by_sentAt_desc')),
            Get(ref),
          ),
        ),
      ),
    )) as DbMessageContact[];
    if (result) {
      if (after) {
        result.shift();
      }
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

  async updateLeadReatAt(updateLeadReadAtDto: UpdateReadAtDto) {
    const result = await this.dbService.query<DbFranchisingLead>(
      Update(
        Select(
          ['ref'],
          Get(Match(Index('lead_by_id'), updateLeadReadAtDto.id)),
        ),
        {
          data: {
            readAt: Math.round(
              new Date(updateLeadReadAtDto.readAt).getTime() / 1000,
            ),
          },
        },
      ),
    );

    return result;
  }

  async updateMessageReatAt(updateMessageReadAtDto: UpdateReadAtDto) {
    const result = await this.dbService.query<DbMessageContact>(
      Update(
        Select(
          ['ref'],
          Get(Match(Index('message_by_id'), updateMessageReadAtDto.id)),
        ),
        {
          data: {
            readAt: Math.round(
              new Date(updateMessageReadAtDto.readAt).getTime() / 1000,
            ),
          },
        },
      ),
    );

    return result;
  }

  async getNewLeadsAndMessages() {
    let newLeads = (await this.dbService.query<[number]>(
      Sum(
        Map(
          Paginate(Documents(Collection('leads'))),
          Lambda((ref) =>
            If(ContainsField('readAt', Select('data', Get(ref))), 0, 1),
          ),
        ),
      ),
    )) as [number];
    if (!newLeads) {
      newLeads = [0];
    }
    let newMessages = (await this.dbService.query<[number]>(
      Sum(
        Map(
          Paginate(Documents(Collection('messages'))),
          Lambda((ref) =>
            If(ContainsField('readAt', Select('data', Get(ref))), 0, 1),
          ),
        ),
      ),
    )) as [number];
    if (!newMessages) {
      newMessages = [0];
    }
    return { newLeads: newLeads[0], newMessages: newMessages[0] };
  }
}
