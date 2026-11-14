import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
} from 'typeorm';

import { UserEntity } from '../../../users/entities/user.entity/user.entity';
import { WishEntity } from '../../../wishes/entities/wish.entity/wish.entity';

@Entity()
export class OfferEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.offers)
  user: UserEntity;

  @ManyToOne(() => WishEntity, (wish) => wish.offers, {
    onDelete: 'CASCADE',
  })
  item: WishEntity;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    default: false,
  })
  hidden: boolean;
}
