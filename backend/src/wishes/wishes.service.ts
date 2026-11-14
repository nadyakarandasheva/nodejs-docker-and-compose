import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { WishEntity } from './entities/wish.entity/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { UserEntity } from '../users/entities/user.entity/user.entity';
import { WishlistEntity } from 'src/wishlists/entities/wishlist.entity/wishlist.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(WishEntity)
    private readonly wishRepository: Repository<WishEntity>,

    @InjectRepository(WishlistEntity)
    private readonly wishlistRepository: Repository<WishlistEntity>,
  ) {}

  async create(wishData: CreateWishDto): Promise<WishEntity> {
    const wish = this.wishRepository.create(wishData);

    return this.wishRepository.save(wish);
  }

  async findOne(
    query: FindOptionsWhere<WishEntity>,
  ): Promise<WishEntity | null> {
    return this.wishRepository.findOne({
      where: query,
    });
  }

  async updateOne(
    query: FindOptionsWhere<WishEntity>,
    data: UpdateWishDto,
  ): Promise<WishEntity | null> {
    const wish = await this.findOne(query);

    if (!wish) {
      return null;
    }

    Object.assign(wish, data);

    return this.wishRepository.save(wish);
  }

  async removeOne(query: FindOptionsWhere<WishEntity>): Promise<void> {
    await this.wishRepository.delete(query);
  }

  async createWish(
    data: CreateWishDto,
    owner: UserEntity,
  ): Promise<WishEntity> {
    const wish = this.wishRepository.create({
      ...data,
      owner,
      raised: 0,
      copied: 0,
    });

    return this.wishRepository.save(wish);
  }

  async findWishById(id: number): Promise<WishEntity | null> {
    return this.wishRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: true,
      },
    });
  }

  async findLast(): Promise<WishEntity[]> {
    return this.wishRepository.find({
      relations: {
        owner: true,
        offers: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async findTop(): Promise<WishEntity[]> {
    return this.wishRepository.find({
      relations: {
        owner: true,
        offers: true,
      },
      order: {
        copied: 'DESC',
      },
      take: 10,
    });
  }

  async updateWish(
    id: number,
    userId: number,
    data: UpdateWishDto,
  ): Promise<WishEntity> {
    const wish = await this.findWishById(id);

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужой подарок');
    }

    if (data.price !== undefined && wish.offers.length > 0) {
      throw new ForbiddenException(
        'Нельзя изменить стоимость подарка, если уже есть желающие скинуться',
      );
    }

    const updatedWish = await this.updateOne({ id }, data);

    if (!updatedWish) {
      throw new NotFoundException('Подарок не найден');
    }

    return updatedWish;
  }

  async removeWish(id: number, userId: number): Promise<WishEntity> {
    const wish = await this.findWishById(id);

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалить чужой подарок');
    }

    const wishlists = await this.wishlistRepository.find({
      relations: {
        items: true,
      },
    });

    for (const wishlist of wishlists) {
      const hasWish = wishlist.items.some((item) => item.id === wish.id);

      if (hasWish) {
        wishlist.items = wishlist.items.filter((item) => item.id !== wish.id);

        await this.wishlistRepository.save(wishlist);
      }
    }

    await this.removeOne({ id });

    return wish;
  }

  async copyWish(id: number, owner: UserEntity): Promise<WishEntity> {
    const originalWish = await this.findWishById(id);

    if (!originalWish) {
      throw new NotFoundException('Подарок не найден');
    }

    const copiedWish = this.wishRepository.create({
      name: originalWish.name,
      link: originalWish.link,
      image: originalWish.image,
      price: originalWish.price,
      description: originalWish.description,

      owner,

      raised: 0,
      copied: 0,
    });

    await this.wishRepository.save(copiedWish);

    originalWish.copied += 1;

    await this.wishRepository.save(originalWish);

    return copiedWish;
  }
}
