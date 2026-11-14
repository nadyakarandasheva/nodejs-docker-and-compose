import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { WishlistEntity } from './entities/wishlist.entity/wishlist.entity';
import { WishEntity } from '../wishes/entities/wish.entity/wish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity, WishEntity])],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
