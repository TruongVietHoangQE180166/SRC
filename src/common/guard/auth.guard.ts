import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const deviceId = request.headers['device-id'];
  
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }
  
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }
  
    const [bearer, token] = authHeader.split(' ');
  
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as any;
  
      const user = await this.authService.findOne(decoded.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      if (!user.isActive) {
        const refreshToken = request.headers['refresh-token'];
        if (refreshToken) {
          await this.authService.logout(refreshToken, deviceId);
        }
        throw new UnauthorizedException('Your account has been banned');
      }
  
      
      request.user = {
        id: decoded.id,
        email: user.email,
        role: user.role,
        _id: user._id
      };
  
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}