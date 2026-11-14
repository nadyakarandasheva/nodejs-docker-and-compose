import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { OfferEntity } from './entities/offer.entity/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { UserEntity } from '../users/entities/user.entity/user.entity';
import { WishEntity } from '../wishes/entities/wish.entity/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OfferEntity)
    private readonly offerRepository: Repository<OfferEntity>,

    @InjectRepository(WishEntity)
    private readonly wishRepository: Repository<WishEntity>,
  ) {}

  async create(offerData: Partial<OfferEntity>): Promise<OfferEntity> {
    const offer = this.offerRepository.create(offerData);

    return this.offerRepository.save(offer);
  }

  async findOne(
    query: FindOptionsWhere<OfferEntity>,
  ): Promise<OfferEntity | null> {
    return this.offerRepository.findOne({
      where: query,
      relations: {
        item: {
          owner: true,
        },
        user: true,
      },
    });
  }

  async findMany(
    query?: FindOptionsWhere<OfferEntity>,
  ): Promise<OfferEntity[]> {
    return this.offerRepository.find({
      where: query,
      relations: {
        item: {
          owner: true,
        },
        user: true,
      },
    });
  }

  async updateOne(
    query: FindOptionsWhere<OfferEntity>,
    data: UpdateOfferDto,
  ): Promise<OfferEntity | null> {
    const offer = await this.findOne(query);

    if (!offer) {
      return null;
    }

    Object.assign(offer, data);

    return this.offerRepository.save(offer);
  }

  async removeOne(query: FindOptionsWhere<OfferEntity>): Promise<void> {
    await this.offerRepository.delete(query);
  }

  async createOffer(
    data: CreateOfferDto,
    user: UserEntity,
  ): Promise<OfferEntity> {
    const wish = await this.wishRepository.findOne({
      where: {
        id: data.itemId,
      },
      relations: {
        owner: true,
      },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Нельзя скидываться на собственный подарок');
    }

    const raised = Number(wish.raised);
    const price = Number(wish.price);
    const amount = Number(data.amount);

    if (raised >= price) {
      throw new BadRequestException('На подарок уже собрана необходимая сумма');
    }

    if (raised + amount > price) {
      throw new BadRequestException(
        'Сумма взноса превышает оставшуюся стоимость подарка',
      );
    }

    const offer = await this.create({
      amount,
      hidden: data.hidden ?? false,
      item: wish,
      user,
    });

    wish.raised = raised + amount;

    await this.wishRepository.save(wish);

    return offer;
  }

  async getOffers(currentUser: UserEntity) {
    const offers = await this.findMany();

    return offers.map((offer) => this.hideUserIfNeeded(offer, currentUser));
  }

  async getOfferById(id: number, currentUser: UserEntity) {
    const offer = await this.findOne({
      id,
    });

    if (!offer) {
      throw new NotFoundException('Заявка не найдена');
    }

    return this.hideUserIfNeeded(offer, currentUser);
  }

  private hideUserIfNeeded(offer: OfferEntity, currentUser: UserEntity) {
    if (offer.hidden && offer.user.id !== currentUser.id) {
      const offerWithoutUser = { ...offer };

      delete offerWithoutUser.user;

      return offerWithoutUser;
    }

    return offer;
  }
}
