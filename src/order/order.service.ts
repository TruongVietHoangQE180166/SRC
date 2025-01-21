import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { Product } from '../product/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }


  async findOne(id: number): Promise<Order> {
    const order = await this.orderModel
      .findOne({ id })
      .populate('user', '-password')
      .populate('products.product')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }


  async findAll(page: number, limit: number): Promise<{ data: Order[]; total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderModel
        .find()
        .populate('user', '-password')
        .populate('products.product')
        .skip(skip)
        .limit(limit)
        .sort({ orderDate: -1 })
        .exec(),
      this.orderModel.countDocuments(),
    ]);

    return { data, total };
  }


  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const productUpdates = [];
    let totalAmount = 0;


    for (const item of createOrderDto.products) {
      const product = await this.productModel.findById(item.product);

      if (!product) {
        throw new BadRequestException(
          `Product with ID ${item.product} not found`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name || product._id}`,
        );
      }

      productUpdates.push(
        this.productModel.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } },
        ),
      );

      totalAmount += product.price * item.quantity;
    }


    await Promise.all(productUpdates);


    const newOrder = new this.orderModel({
      ...createOrderDto,
      totalAmount,
      status: createOrderDto.status || 'pending',
      orderDate: new Date(),
    });

    return await newOrder.save();
  }



  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderModel.findOne({ id });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }


    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }


    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BadRequestException('Cannot update completed or cancelled orders');
    }

    order.status = status;
    return await order.save();
  }


  async cancelOrder(id: number): Promise<Order> {
    const order = await this.orderModel.findOne({ id });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('Can only cancel pending orders');
    }


    const productUpdates = order.products.map((item) =>
      this.productModel.updateOne(
        { id: item.product['id'] },
        { $inc: { stock: item.quantity } },
      ),
    );

    await Promise.all(productUpdates);

    order.status = 'cancelled';
    return await order.save();
  }


  async remove(id: number): Promise<void> {
    const order = await this.orderModel.findOne({ id });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === 'pending') {

      const productUpdates = order.products.map((item) =>
        this.productModel.updateOne(
          { id: item.product['id'] },
          { $inc: { stock: item.quantity } },
        ),
      );

      await Promise.all(productUpdates);
    }

    await this.orderModel.deleteOne({ id });
  }
}