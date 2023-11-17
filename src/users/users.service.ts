import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { genSalt, hash } from 'bcryptjs';
import { IDbUser } from '../shared/interfaces/db-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuid } from 'uuid';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { FirestoreService } from '../db/firestore.service';
import { Collection } from '../db/collection.enum';
import { inspect } from 'util';
import { FirestoreFilter } from '../db/interfaces';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');
  constructor(private firestoreService: FirestoreService) {}

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
    try {
      const result = await this.firestoreService.create<IDbUser>(
        Collection.USERS,
        newUser,
      );
      // send user e-mail
      return this.firestoreService.parseFirebaseResult(
        Collection.USERS,
        result,
      ) as User;
    } catch (error) {
      this.logger.error(
        `updateUnits error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async findAll() {
    try {
      const result = await this.firestoreService.get(Collection.USERS);
      if (!result || !result.success || !result.data) {
        throw new BadRequestException(
          `findAll failed ${inspect({ result }, { depth: null })}`,
        );
      }
      return this.firestoreService.parseFirebaseResult(
        Collection.USERS,
        result,
      );
    } catch (error) {
      this.logger.error(
        `findAll error: ${inspect({ error }, { depth: null })}`,
      );
      return [];
    }
  }

  async findOne(id: string): Promise<IDbUser | undefined> {
    try {
      const result = await this.firestoreService.getOne(Collection.USERS, id);

      if (!result || !result.success || !result.data) {
        throw new BadRequestException(
          `findOne failed ${inspect({ result }, { depth: null })}`,
        );
      }
      return this.firestoreService.parseFirebaseResult(
        Collection.USERS,
        result,
      ) as IDbUser;
    } catch (error) {
      this.logger.error(
        `findOne error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async findOneByEmail(email: string) {
    try {
      const filters = [
        { fieldPath: 'email', filterOp: '==', value: email } as FirestoreFilter,
      ];
      const result = await this.firestoreService.get(Collection.USERS, filters);
      if (!result || !result.success || !result.data) {
        throw new BadRequestException(
          `findOneByEmail failed ${inspect({ result }, { depth: null })}`,
        );
      }
      return this.firestoreService.parseFirebaseResult(
        Collection.USERS_AUTH,
        result,
      ) as User;
    } catch (error) {
      this.logger.error(
        `findOneByEmail error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    try {
      const { id } = updateUserDto;
      return (await this.firestoreService.update(
        Collection.USERS,
        id,
        updateUserDto,
      )) as User;
    } catch (error) {
      this.logger.error(`update error: ${inspect({ error }, { depth: null })}`);
    }
  }

  async updatePassword(
    id: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    try {
      const salt = await genSalt();
      const hashedPassword = await hash(updateUserPasswordDto.password, salt);
      const password = salt + ':' + hashedPassword;

      const result = await this.firestoreService.update(Collection.USERS, id, {
        password,
      });
      return result as User;
    } catch (error) {
      this.logger.error(
        `updatePassword error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const result = await this.firestoreService.delete(Collection.USERS, id);
      if (!result) {
        throw new BadRequestException(`failed: ${{ result, id }}`);
      }
      return true;
    } catch (error) {
      this.logger.error(`update error: ${inspect({ error }, { depth: null })}`);

      return false;
    }
  }
}
