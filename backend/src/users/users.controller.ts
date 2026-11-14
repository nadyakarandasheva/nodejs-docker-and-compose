import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Request,
  UseGuards,
  Post,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashService } from '../hash/hash.service';
import { UserEntity } from './entities/user.entity/user.entity';
import { FindUserDto } from './dto/find-user.dto';
import {
  sanitizePublicUser,
  sanitizeUser,
} from './helpers/sanitize-user.helper';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
  ) {}

  @Get('me')
  async getMe(@Request() req: { user: UserEntity }) {
    const user = await this.usersService.findOneWithEmail(req.user.id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return sanitizeUser(user);
  }

  @Patch('me')
  async updateMe(
    @Request() req: { user: UserEntity },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto.username) {
      const usernameTaken = await this.usersService.isUsernameTaken(
        updateUserDto.username,
        req.user.id,
      );

      if (usernameTaken) {
        throw new ConflictException(
          'Пользователь с таким username уже существует',
        );
      }
    }

    if (updateUserDto.email) {
      const emailTaken = await this.usersService.isEmailTaken(
        updateUserDto.email,
        req.user.id,
      );

      if (emailTaken) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hashPassword(
        updateUserDto.password,
      );
    }

    const user = await this.usersService.updateOne(
      { id: req.user.id },
      updateUserDto,
    );

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return sanitizeUser(user);
  }

  @Get('me/wishes')
  async getMyWishes(@Request() req: { user: UserEntity }) {
    const user = await this.usersService.findOneWithWishes({
      id: req.user.id,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes;
  }

  @Post('find')
  async findUsers(@Body() findUserDto: FindUserDto) {
    const users = await this.usersService.findMany([
      { username: findUserDto.query },
      { email: findUserDto.query },
    ]);

    return users.map(sanitizePublicUser);
  }

  @Get(':username')
  async getUser(@Param('username') username: string) {
    const user = await this.usersService.findOne({
      username,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return sanitizePublicUser(user);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findOneWithWishes({
      username,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes;
  }
}
