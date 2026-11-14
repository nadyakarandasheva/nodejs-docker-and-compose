import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Column,
} from 'typeorm';

import { OfferEntity } from '../../../offers/entities/offer.entity/offer.entity';
import { WishlistEntity } from '../../../wishlists/entities/wishlist.entity/wishlist.entity';
import { WishEntity } from '../../../wishes/entities/wish.entity/wish.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    unique: true,
    length: 30,
  })
  username: string;

  @Column({
    length: 200,
    default: 'Пока ничего не рассказал о себе',
  })
  about: string;

  @Column({
    default: 'https://i.pravatar.cc/300',
  })
  avatar: string;

  @Column({
    unique: true,
    select: false,
  })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @OneToMany(() => WishEntity, (wish) => wish.owner)
  wishes: WishEntity[];

  @OneToMany(() => OfferEntity, (offer) => offer.user)
  offers: OfferEntity[];

  @OneToMany(() => WishlistEntity, (wishlist) => wishlist.owner)
  wishlists: WishlistEntity[];
}
