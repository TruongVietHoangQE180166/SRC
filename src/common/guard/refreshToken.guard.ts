import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers['refresh-token'];
    const deviceId = request.headers['device-id'];

    if (!refreshToken || !deviceId) {
      throw new UnauthorizedException('Refresh token and device ID are required');
    }

    try {
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as any;
      console.log(decoded);
      
      const deviceToken = await this.authService.findDeviceToken(decoded._id);
      console.log(deviceToken);
      if (!deviceToken) {
        throw new UnauthorizedException('Invalid refresh token or device ID');
      }
      
      
      const user = await this.authService.findOne(decoded.id);
      console.log(user);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Your account has been banned or deactivated');
      }

      
      request.user = {
        id: decoded.id,
        email: user.email,
        role: user.role,
        _id: user._id
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
