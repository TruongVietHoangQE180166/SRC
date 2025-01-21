import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  // Create a new product
  async create(createDto: CreateProductDto): Promise<Product> {
    // Validate required fields
    if (!createDto.id) {
      throw new BadRequestException('Product ID is required');
    }

    // Check for existing product by ID
    const existingProduct = await this.productModel.findOne({
      id: createDto.id,
    });

    if (existingProduct) {
      throw new BadRequestException('Product with this ID already exists');
    }

    // Create a new product record
    const newProduct = new this.productModel({
      id: createDto.id,
      name: createDto.name,
      price: createDto.price,
      description: createDto.description,
      category: createDto.category,
      stock: createDto.stock,
      isActive: createDto.isActive ?? true,
    });

    return await newProduct.save();
  }

  // Update an existing product
  async update(id: number, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel.findOne({ id });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return await this.productModel
      .findOneAndUpdate({ id }, updateDto, { new: true })
      .exec();
  }

  // Remove a product
  async remove(id: number): Promise<void> {
    const result = await this.productModel.deleteOne({ id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  // Get all products with pagination
  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel.find().skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(),
    ]);

    return { data, total };
  }

  // Get a single product by ID
  async findOne(id: number): Promise<Product> {
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('ID must be a positive integer');
    }

    const product = await this.productModel.findOne({ id }).exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }
}
