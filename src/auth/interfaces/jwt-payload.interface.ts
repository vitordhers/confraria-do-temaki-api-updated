import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../../shared/enums/user-role.enum';

export interface IJwtPayload extends JwtPayload {
  id: string;
  role: UserRole;
}
