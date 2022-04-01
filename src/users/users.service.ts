import { BadRequestException, Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcryptjs';
import {
  Collection,
  Get,
  Index,
  Match,
  Map,
  Paginate,
  Documents,
  Lambda,
  Update,
  Select,
  Create,
  Delete,
} from 'faunadb';
import { IDbUser } from '../shared/interfaces/db-user.interface';
import { FaunaDbService } from '../db/faunadb.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuid } from 'uuid';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Injectable()
export class UsersService {
  constructor(private dbService: FaunaDbService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, surname, email, unitsOwnedIds, role, password } =
      createUserDto;
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);
    const storedPass = salt + ':' + hashedPassword;
    const newUser: IDbUser = {
      id: uuid(),
      name,
      surname,
      email,
      unitsOwnedIds,
      role,
      password: storedPass,
    };
    const result = await this.dbService.query<IDbUser>(
      Create(Collection('users'), {
        data: newUser,
      }),
    );
    // send user e-mail
    return result as IDbUser;
  }

  async findAll(size = 1000) {
    const result = (await this.dbService.query<IDbUser>(
      Map(
        Paginate(Documents(Collection('users')), { size }),
        Lambda((x) => Get(x)),
      ),
    )) as IDbUser[];
    if (result) {
      return result.map((user) => new User(user));
    }
    return [];
  }

  async findOne(id: string): Promise<IDbUser | undefined> {
    const result = (await this.dbService.query<IDbUser>(
      Get(Match(Index('user_by_id'), id)),
    )) as IDbUser;
    if (!result) {
      return undefined;
    }
    return result;
  }

  async findOneByEmail(email: string) {
    const result = (await this.dbService.query<IDbUser>(
      Get(Match(Index('user_by_email'), email)),
    )) as IDbUser;
    if (!result) {
      return undefined;
    }
    return result;
  }

  async update(updateUserDto: UpdateUserDto) {
    const result = (await this.dbService.query<IDbUser>(
      Update(
        Select(['ref'], Get(Match(Index('user_by_id'), updateUserDto.id))),
        {
          data: updateUserDto,
        },
      ),
    )) as IDbUser;
    if (!result) {
      throw new BadRequestException();
    }
    return new User(result);
  }

  async updatePassword(
    id: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const salt = await genSalt();
    const hashedPassword = await hash(updateUserPasswordDto.password, salt);
    const password = salt + ':' + hashedPassword;

    const result = (await this.dbService.query<IDbUser>(
      Update(Select(['ref'], Get(Match(Index('user_by_id'), id))), {
        data: { password },
      }),
    )) as IDbUser;
    if (!result) {
      throw new BadRequestException();
    }
    return;
  }

  async remove(id: string) {
    const result = (await this.dbService.query<IDbUser>(
      Delete(Select(['ref'], Get(Match(Index('user_by_id'), id)))),
    )) as IDbUser;
    if (!result) {
      throw new BadRequestException(`User with id ${id} couldn't be deleted`);
    }
    return;
  }
}
