import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { UserEntity } from '../users/entities/user.entity/user.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Request() req: { user: UserEntity },
    @Body() createWishDto: CreateWishDto,
  ) {
    return this.wishesService.createWish(createWishDto, req.user);
  }

  @Get('last')
  async findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  async findTop() {
    return this.wishesService.findTop();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const wish = await this.wishesService.findWishById(id);

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return wish;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Request() req: { user: UserEntity },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishesService.updateWish(id, req.user.id, updateWishDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(
    @Request() req: { user: UserEntity },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishesService.removeWish(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/copy')
  async copy(
    @Request() req: { user: UserEntity },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishesService.copyWish(id, req.user);
  }
}
