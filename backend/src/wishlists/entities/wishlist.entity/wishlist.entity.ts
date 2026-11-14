import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { WishEntity } from '../../../wishes/entities/wish.entity/wish.entity';
import { UserEntity } from '../../../users/entities/user.entity/user.entity';

@Entity()
export class WishlistEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    length: 250,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 1500,
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  image?: string;

  @ManyToOne(() => UserEntity, (user) => user.wishlists)
  owner: UserEntity;

  @ManyToMany(() => WishEntity)
  @JoinTable()
  items: WishEntity[];
}
