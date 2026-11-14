import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsArray()
  @IsInt({ each: true })
  itemsId: number[];
}
