import { IUser } from './user.interface';

export interface IDbUser extends IUser {
  password?: string;
}
