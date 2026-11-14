import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  about?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
