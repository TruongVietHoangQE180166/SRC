import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      const data = await this.orderService.create(createOrderDto);
      return {
        method: 'CREATE',
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'CREATE',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }
  @UseGuards(AuthGuard, AdminGuard)
  @Get('list')
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    try {
      if (!page || !limit) {
        throw new Error('Page and limit are required');
      }
      const result = await this.orderService.findAll(+page, +limit);
      return {
        method: 'GET_ALL',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'GET_ALL',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }
  @UseGuards(AuthGuard)
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.orderService.findOne(+id);
      return {
        method: 'GET_ONE',
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'GET_ONE',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    try {
      const data = await this.orderService.updateStatus(+id, status);
      return {
        method: 'UPDATE_STATUS',
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'UPDATE_STATUS',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }

  @UseGuards(AuthGuard)
  @Post('cancel/:id')
  async cancelOrder(@Param('id') id: string) {
    try {
      const data = await this.orderService.cancelOrder(+id);
      return {
        method: 'CANCEL',
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'CANCEL',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    try {
      await this.orderService.remove(+id);
      return {
        method: 'DELETE',
        data: { message: `Order with ID ${id} deleted successfully` },
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'DELETE',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }
}