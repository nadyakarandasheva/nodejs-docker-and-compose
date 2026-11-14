import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UserEntity } from '../users/entities/user.entity/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(
    @Request() req: { user: UserEntity },
    @Body() createOfferDto: CreateOfferDto,
  ) {
    return this.offersService.createOffer(createOfferDto, req.user);
  }

  @Get()
  async findAll(@Request() req: { user: UserEntity }) {
    return this.offersService.getOffers(req.user);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: UserEntity },
  ) {
    return this.offersService.getOfferById(id, req.user);
  }
}
