import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import { WishlistEntity } from './entities/wishlist.entity/wishlist.entity';
import { WishEntity } from '../wishes/entities/wish.entity/wish.entity';
import { UserEntity } from '../users/entities/user.entity/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishlistEntity)
    private readonly wishlistRepository: Repository<WishlistEntity>,

    @InjectRepository(WishEntity)
    private readonly wishRepository: Repository<WishEntity>,
  ) {}

  async create(
    data: CreateWishlistDto,
    owner: UserEntity,
  ): Promise<WishlistEntity> {
    const items = await this.wishRepository.find({
      where: {
        id: In(data.itemsId),
      },
    });

    const wishlist = this.wishlistRepository.create({
      name: data.name,
      description: data.description,
      image: data.image,
      owner,
      items,
    });

    return this.wishlistRepository.save(wishlist);
  }

  /** Здесь и в других местах использую FindOptionsWhere - это подсказал gpt,
   *  чтобы было удобно работат с квери параметрами */
  async findOne(
    query: FindOptionsWhere<WishlistEntity>,
  ): Promise<WishlistEntity | null> {
    return this.wishlistRepository.findOne({
      where: query,
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async findMany(): Promise<WishlistEntity[]> {
    return this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async updateOne(
    query: FindOptionsWhere<WishlistEntity>,
    data: UpdateWishlistDto,
  ): Promise<WishlistEntity | null> {
    const wishlist = await this.findOne(query);

    if (!wishlist) {
      return null;
    }

    if (data.name !== undefined) {
      wishlist.name = data.name;
    }

    if (data.description !== undefined) {
      wishlist.description = data.description;
    }

    if (data.image !== undefined) {
      wishlist.image = data.image;
    }

    if (data.itemsId !== undefined) {
      wishlist.items = await this.wishRepository.find({
        where: {
          id: In(data.itemsId),
        },
      });
    }

    return this.wishlistRepository.save(wishlist);
  }

  async removeOne(query: FindOptionsWhere<WishlistEntity>): Promise<void> {
    await this.wishlistRepository.delete(query);
  }

  async updateWishlist(
    id: number,
    user: UserEntity,
    data: UpdateWishlistDto,
  ): Promise<WishlistEntity> {
    const wishlist = await this.findOne({ id });

    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Нельзя редактировать чужой вишлист');
    }

    const updatedWishlist = await this.updateOne({ id }, data);

    if (!updatedWishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    return updatedWishlist;
  }

  async removeWishlist(id: number, user: UserEntity): Promise<WishlistEntity> {
    const wishlist = await this.findOne({ id });

    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Нельзя удалить чужой вишлист');
    }

    await this.removeOne({ id });

    return wishlist;
  }
}
