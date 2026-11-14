import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SignupDto } from './dto/signup.dto';
import { UserEntity } from '../users/entities/user.entity/user.entity';
import { HashService } from '../hash/hash.service';
import { UsersService } from '../users/users.service';
import { sanitizeUser } from 'src/users/helpers/sanitize-user.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.findOneForAuth(username);

    if (!user) {
      return null;
    }

    const isPasswordCorrect = await this.hashService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordCorrect) {
      return null;
    }

    return user;
  }

  login(user: UserEntity) {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(signupDto: SignupDto) {
    const usernameTaken = await this.usersService.isUsernameTaken(
      signupDto.username,
    );

    if (usernameTaken) {
      throw new ConflictException(
        'Пользователь с таким username уже существует',
      );
    }

    const emailTaken = await this.usersService.isEmailTaken(signupDto.email);

    if (emailTaken) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await this.hashService.hashPassword(
      signupDto.password,
    );

    const user = await this.usersService.create({
      ...signupDto,
      password: hashedPassword,
    });

    return sanitizeUser(user);
  }
}
