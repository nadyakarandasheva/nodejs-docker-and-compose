import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { UserEntity } from '../../../users/entities/user.entity/user.entity';
import { OfferEntity } from '../../../offers/entities/offer.entity/offer.entity';

@Entity()
export class WishEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 250,
  })
  name: string;

  @Column()
  link: string;

  @Column()
  image: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  raised: number;

  @ManyToOne(() => UserEntity, (user) => user.wishes)
  owner: UserEntity;

  @Column({
    length: 1024,
  })
  description: string;

  @OneToMany(() => OfferEntity, (offer) => offer.item)
  offers: OfferEntity[];

  @Column({
    type: 'int',
    default: 0,
  })
  copied: number;
}
