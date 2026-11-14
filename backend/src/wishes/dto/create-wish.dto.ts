import {
  IsString,
  IsUrl,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateWishDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsPositive()
  price: number;

  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  description: string;
}
