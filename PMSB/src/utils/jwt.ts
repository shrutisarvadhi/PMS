import jwt, { type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken';
import { appConfig } from '../config/env';
import { UserRole } from '../models/user.model';

interface TokenPayloadInput {
  id: string;
  username: string;
  role: UserRole;
}

export const signAuthToken = (user: TokenPayloadInput): string => {
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: appConfig.jwt.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, appConfig.jwt.secret as Secret, options);
};
