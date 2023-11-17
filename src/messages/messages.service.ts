import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import FranchisingContactDto from './dto/franchising-contact.dto';
import { ConfigService } from '@nestjs/config';
import { DbFranchisingLead } from './entities/db-franchising-lead.entity';
import { v4 as uuid } from 'uuid';
import { UpdateReadAtDto } from './dto/update-lead-read-at.dto';
import CreateContactMessageDto from './dto/create-contact-message.dto';
import { DbMessageContact } from './entities/db-message-contact.entity';
import { FirestoreService } from '../db/firestore.service';
import { Collection } from '../db/collection.enum';
import { inspect } from 'util';
import { FirestoreFilter } from '../db/interfaces';

@Injectable()
export class MessagesService {
  private logger = new Logger('MessagesService');
  private transporter: Transporter;

  constructor(
    private configService: ConfigService,
    private firestoreService: FirestoreService,
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
    try {
      const result = await this.firestoreService.create(
        Collection.LEADS,
        newFranchisingLead,
      );

      return result?.success;
    } catch (error) {
      this.logger.error(
        `createFranchisingLead error ${inspect({ error }, { depth: null })}`,
      );
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

    try {
      const result = await this.firestoreService.create(
        Collection.MESSAGES,
        newMessageContactDto,
      );

      return result?.success;
    } catch (error) {
      this.logger.error(
        `createContactMessage error ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async getFranchisingLeads({ after, size }: { after?: number; size: number }) {
    try {
      const result = await this.firestoreService.get(
        Collection.LEADS,
        undefined,
        { field: 'sentAt', order: 'desc' },
        { startAfter: after, pageSize: size },
      );

      if (!result || !result.success) {
        throw new BadRequestException(
          `getFranchisingLeads failed: ${inspect({ result }, { depth: null })}`,
        );
      }

      const leads = this.firestoreService.parseFirebaseResult(
        Collection.LEADS,
        result,
      ) as DbFranchisingLead[];

      return leads;
    } catch (error) {
      this.logger.error(
        `getFranchisingLeads error ${inspect({ error }, { depth: null })}`,
      );
      return [];
    }
  }

  async getMessageContacts({ after, size }: { after?: number; size: number }) {
    try {
      const result = await this.firestoreService.get(
        Collection.MESSAGES,
        undefined,
        { field: 'sentAt', order: 'desc' },
        { startAfter: after, pageSize: size },
      );

      if (!result || !result.success) {
        throw new BadRequestException(
          `getMessageContacts failed: ${inspect({ result }, { depth: null })}`,
        );
      }

      const messages = this.firestoreService.parseFirebaseResult(
        Collection.MESSAGES,
        result,
      ) as DbMessageContact[];

      return messages;
    } catch (error) {
      this.logger.error(
        `getMessageContacts error ${inspect({ error }, { depth: null })}`,
      );
      return [];
    }
  }

  async sendFranchisingEmail(franchisingLead: DbFranchisingLead) {
    this.transporter.verify((error) => {
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
    const { id } = updateLeadReadAtDto;
    try {
      const lead = (await this.firestoreService.update(
        Collection.LEADS,
        id,
        updateLeadReadAtDto,
      )) as DbFranchisingLead;

      return lead;
    } catch (error) {
      this.logger.error(
        `updateLeadReatAt error ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async updateMessageReatAt(updateMessageReadAtDto: UpdateReadAtDto) {
    try {
      const { id } = updateMessageReadAtDto;
      const message = (await this.firestoreService.update(
        Collection.MESSAGES,
        id,
        updateMessageReadAtDto,
      )) as DbFranchisingLead;

      return message;
    } catch (error) {
      this.logger.error(
        `updateMessageReatAt error ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async getNewLeadsAndMessages() {
    let newLeads = 0;

    try {
      const unreadLeadResults = await this.firestoreService.get(
        Collection.LEADS,
        [
          {
            fieldPath: 'readAt',
            filterOp: '==',
            value: null,
          } as FirestoreFilter,
        ],
      );
      if (
        unreadLeadResults &&
        unreadLeadResults.success &&
        unreadLeadResults.data
      ) {
        newLeads = Array.isArray(unreadLeadResults.data)
          ? unreadLeadResults.data.length
          : 1;
      }
    } catch (error) {
      this.logger.error(
        `getNewLeadsAndMessages error ${inspect({ error }, { depth: null })}`,
      );
    }

    let newMessages = 0;
    try {
      const unreadMessageResults = await this.firestoreService.get(
        Collection.MESSAGES,
        [
          {
            fieldPath: 'readAt',
            filterOp: '==',
            value: null,
          } as FirestoreFilter,
        ],
      );
      if (
        unreadMessageResults &&
        unreadMessageResults.success &&
        unreadMessageResults.data
      ) {
        newMessages = Array.isArray(unreadMessageResults.data)
          ? unreadMessageResults.data.length
          : 1;
      }
    } catch (error) {
      this.logger.error(
        `getNewLeadsAndMessages error ${inspect({ error }, { depth: null })}`,
      );
    }

    return { newLeads, newMessages };
  }
}
