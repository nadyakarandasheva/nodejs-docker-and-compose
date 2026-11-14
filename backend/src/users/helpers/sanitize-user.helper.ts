import { UserEntity } from '../entities/user.entity/user.entity';

export type SafeUser = Omit<UserEntity, 'password'>;

export type PublicUser = Omit<UserEntity, 'password' | 'email'>;

export function sanitizeUser(user: UserEntity): SafeUser {
  const result: Partial<UserEntity> = { ...user };

  delete result.password;

  return result as SafeUser;
}

export function sanitizePublicUser(user: UserEntity): PublicUser {
  const result: Partial<UserEntity> = { ...user };

  delete result.password;
  delete result.email;

  return result as PublicUser;
}
