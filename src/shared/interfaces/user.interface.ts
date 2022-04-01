import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  unitsOwnedIds: string[];
  role: UserRole;
}
