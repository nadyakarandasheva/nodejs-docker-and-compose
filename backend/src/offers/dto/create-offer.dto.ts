import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateOfferDto {
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsInt()
  @IsPositive()
  itemId: number;
}
