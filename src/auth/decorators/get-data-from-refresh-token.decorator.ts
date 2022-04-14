import { createParamDecorator } from '@nestjs/common';
import { UserRole } from '../../shared/enums/user-role.enum';

export const GetDataFromRefreshToken = createParamDecorator(
  (
    a,
    req,
  ): {
    user: { id: string; role: UserRole; unitsOwnedIds: string[] };
    refreshToken: string;
  } => ({
    user: {
      id: req.args[0].user.id,
      role: req.args[0].user.role,
      unitsOwnedIds: req.args[0].user.unitsOwnedIds,
    },
    refreshToken: req.args[0].headers['x-refresh-token'],
  }),
);
