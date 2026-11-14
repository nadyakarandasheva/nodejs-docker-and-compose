import { IsString } from 'class-validator';

/** ДТО авторизации. */
export class SigninDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
