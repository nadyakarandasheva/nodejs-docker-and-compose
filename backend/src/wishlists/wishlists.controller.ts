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

import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { UserEntity } from '../users/entities/user.entity/user.entity';

@Controller('wishlistlists')
@UseGuards(AuthGuard('jwt'))
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async findAll() {
    return this.wishlistsService.findMany();
  }

  @Post()
  async create(
    @Request() req: { user: UserEntity },
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    return this.wishlistsService.create(createWishlistDto, req.user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const wishlist = await this.wishlistsService.findOne({
      id,
    });

    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    return wishlist;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: UserEntity },
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.updateWishlist(
      id,
      req.user,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: UserEntity },
  ) {
    return this.wishlistsService.removeWishlist(id, req.user);
  }
}
