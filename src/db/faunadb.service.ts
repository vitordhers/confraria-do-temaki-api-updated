import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, ExprArg, QueryOptions } from 'faunadb';
import { ConfigService } from '@nestjs/config';
import { FaunaError } from './interfaces/fauna-error.model';

@Injectable()
export class FaunaDbService {
  private client?: Client;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('FAUNA_DB_SECRET');
    this.client = new Client({
      secret,
      domain: 'db.us.fauna.com',
      scheme: 'https',
    });
  }

  async query<T>(
    expr: ExprArg,
    options?: QueryOptions | undefined,
  ): Promise<T | T[]> {
    try {
      if (this.client) {
        const res = await this.client?.query<
          { data: T } | { data: T }[] | { data: { data: T }[] }
        >(expr, options);
        if (res && Array.isArray(res)) {
          return res.map((r) => r.data);
        }
        if (res && !Array.isArray(res) && res.data) {
          if (Array.isArray(res.data)) {
            return res.data.map((d) => d.data);
          }

          return res.data;
        }
        throw new NotFoundException();
      }
      throw new NotFoundException();
    } catch (e: any) {
      console.log('FAUNA DB ERROR', e);
      throw new FaunaError(e);
    }
  }
}
