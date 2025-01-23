import { Controller, Post, Body, BadRequestException, Headers, UseGuards, Get, Param, Request, Patch, Delete, UnauthorizedException, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    try {
      const newUser = await this.authService.register(createAuthDto);
      return {
        message: 'User registered successfully',
        data: newUser,
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message,
      });
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('device-id') deviceId: string,
    @Headers('device-name') deviceName: string,
    @Headers('device-type') deviceType: string,
    @Headers('browser') browser: string,
  ) {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    try {
      const deviceInfo = {
        deviceId,
        deviceName,
        deviceType,
        browser
      };

      const data = await this.authService.login(loginDto, deviceInfo);
      return {
        method: 'LOGIN',
        data
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'LOGIN',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(
    @Headers('refresh-token') refreshToken: string,
    @Headers('device-id') deviceId: string
  ) {
    if (!refreshToken || !deviceId) {
      throw new BadRequestException('Refresh token and Device ID are required');
    }
    console.log('refreshToken:', refreshToken);
    console.log('deviceId:', deviceId);
    try {
      const tokens = await this.authService.refreshToken(refreshToken, deviceId);
      return {
        method: 'REFRESH_TOKEN',
        data: tokens
      };
    } catch (error) {
      throw new UnauthorizedException({
        method: 'REFRESH_TOKEN',
        error: {
          status: 401,
          message: error.message
        }
      });
    }
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Headers('refresh-token') refreshToken: string,
    @Headers('device-id') deviceId: string
  ) {
    if (!refreshToken || !deviceId) {
      throw new BadRequestException('Refresh token and Device ID are required');
    }

    try {
      await this.authService.logout(refreshToken, deviceId);
      return {
        method: 'LOGOUT',
        data: {
          message: 'Logged out successfully'
        }
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'LOGOUT',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }

  @UseGuards(AuthGuard)
  @Post('logout-all-devices')
  async logoutAllDevices(@Request() req) {
    try {
      await this.authService.logoutAllDevices(req.user._id);
      return {
        method: 'LOGOUT_ALL',
        data: {
          message: 'Logged out from all devices successfully'
        }
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'LOGOUT_ALL',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('active-devices')
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    try {
      if (!page || !limit) {
        throw new Error('Page and limit are required');
      }
      const result = await this.authService.findAllDevices(+page, +limit);
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
  @Post('ban/:userId')
  async banUser(@Param('userId') userId: number) {
    try {
      const user = await this.authService.banUser(userId);
      return {
        message: 'User banned successfully',
        data: {
          id: user.id,
          isActive: user.isActive
        }
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message
      });
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('unban/:userId')
  async unbanUser(@Param('userId') userId: number) {
    try {
      const user = await this.authService.unbanUser(userId);
      return {
        message: 'User unbanned successfully',
        data: {
          id: user.id,
          isActive: user.isActive
        }
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message
      });
    }
  }

  @UseGuards(AuthGuard)
  @Get('user-status/:userId')
  async findOne(@Param('userId') userId: number) {
    try {
      const user = await this.authService.findOne(userId);
      return {
        data: user
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message
      });
    }
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  async update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateAuthDto,
    @Request() req
  ) {
    try {
      const data = await this.authService.update(+id, updateDto, req.user.id);
      return {
        method: 'UPDATE',
        data
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'UPDATE',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    try {
      await this.authService.remove(+id);
      return {
        method: 'DELETE',
        data: { message: `user with ID ${id} deleted successfully` }
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'DELETE',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }
}