import { IDbUser } from '../../shared/interfaces/db-user.interface';
import { UserRole } from '../../shared/enums/user-role.enum';
import { Exclude } from 'class-transformer';

export class User implements IDbUser {
  id: string;
  name: string;
  email: string;
  surname: string;
  unitsOwnedIds: string[];
  role: UserRole;

  @Exclude()
  password: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
