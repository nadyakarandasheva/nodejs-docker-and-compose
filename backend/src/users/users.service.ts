import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(userData: CreateUserDto): Promise<UserEntity> {
    const user = this.userRepository.create(userData);

    return this.userRepository.save(user);
  }

  async findOne(
    query: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: query,
    });
  }

  async updateOne(
    query: FindOptionsWhere<UserEntity>,
    data: UpdateUserDto,
  ): Promise<UserEntity | null> {
    const user = await this.findOne(query);

    if (!user) {
      return null;
    }

    Object.assign(user, data);

    return this.userRepository.save(user);
  }

  async removeOne(query: FindOptionsWhere<UserEntity>): Promise<void> {
    await this.userRepository.delete(query);
  }

  async findOneWithWishes(
    query: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: query,
      relations: {
        wishes: true,
      },
    });
  }

  async findMany(query: FindOptionsWhere<UserEntity>[]): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: query,
    });
  }

  async findOneForAuth(username: string): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findOneWithEmail(id: number): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.email')
      .where('user.id = :id', { id })
      .getOne();
  }

  async isUsernameTaken(
    username: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    return !!user && user.id !== excludeUserId;
  }

  async isEmailTaken(email: string, excludeUserId?: number): Promise<boolean> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.email')
      .where('user.email = :email', { email })
      .getOne();

    return !!user && user.id !== excludeUserId;
  }
}
