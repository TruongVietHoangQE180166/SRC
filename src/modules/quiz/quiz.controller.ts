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
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Post('create')
  async create(@Body() createQuizDto: CreateQuizDto) {
    try {
      const data = await this.quizService.create(createQuizDto);
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
      const result = await this.quizService.findAll(+page, +limit);
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
  
  @UseGuards(AuthGuard, AdminGuard)
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.quizService.findOne(id);
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
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    try {
      const data = await this.quizService.update(id, updateQuizDto);
      return {
        method: 'UPDATE',
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'UPDATE',
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
      await this.quizService.remove(id);
      return {
        method: 'DELETE',
        data: { message: `Quiz with ID ${id} deleted successfully` },
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