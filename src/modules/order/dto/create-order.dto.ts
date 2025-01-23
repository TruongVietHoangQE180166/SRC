import { IsNotEmpty, IsArray, IsMongoId, IsNumber, Min, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';


class ProductDto {
    
  
    @IsMongoId()
  @IsNotEmpty()
  product: string; 

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number; 
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string; 

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[]; 
  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled'], {
    message: 'Status must be pending, completed, or cancelled',
  })
  status: string; 

  @IsNumber({}, { message: 'ID must be a number' })
    @IsNotEmpty({ message: 'ID is required' })
    id: number;
}
