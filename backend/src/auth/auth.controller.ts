import { Body, Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { UserEntity } from '../users/entities/user.entity/user.entity';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  signin(@Request() req: { user: UserEntity }) {
    return this.authService.login(req.user);
  }
}
