import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserAccount, DeviceToken} from './schemas/account.schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string>; 

  constructor(
    @InjectModel(UserAccount.name) private userAccountModel: Model<UserAccount>,
    @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceToken>,
  ) {
    this.tokenBlacklist = new Set(); 
  }

  private generateAccessTokens(payload: any) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',  
    });

    return { accessToken };
  }
  
  private generateRefreshTokens(payload: any) {
    
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',   
    });

    return { refreshToken };
  }


  async register(createDto: CreateAuthDto): Promise<Omit<UserAccount, 'password'>> {
   
    if (createDto.password !== createDto.repassword) {
      throw new BadRequestException('Passwords do not match');
    }

    
    const existingEmail = await this.userAccountModel.findOne({
      email: createDto.email,
    });

    if (existingEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    
    const existingId = await this.userAccountModel.findOne({
      id: createDto.id,
    });

    if (existingId) {
      throw new BadRequestException('User with this ID already exists');
    }

    
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    
    const userData = {
      ...createDto,
      password: hashedPassword,
      isActive: true,
      role: 'user',
    };
    delete userData.repassword; 

    
    const newUser = new this.userAccountModel(userData);
    const savedUser = await newUser.save();

    const response = savedUser.toObject();
    delete response.password;
    return response;
  }

  async login(loginDto: LoginDto, deviceInfo: any): Promise<{ accessToken: string; refreshToken: string }> {
    const account = await this.userAccountModel.findOne({ email: loginDto.email });
    if (!account || !account.isActive) {
      throw new UnauthorizedException('Invalid credentials or account banned');
    }


    if (!account.isActive) {
      throw new UnauthorizedException('Your account has been banned');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, account.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    
    const payload = { 
      id: account.id, 
      email: account.email, 
      role: account.role,
      _id: account._id
      
    };
    const {  refreshToken } = this.generateRefreshTokens(payload);
    const {  accessToken } = this.generateAccessTokens(payload);
   
    await this.deviceTokenModel.create({
      userId: account._id,
      deviceId: deviceInfo.deviceId,
      refreshToken,
      lastLogin: new Date(),
      deviceInfo: {
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser
      }
    });

    return { accessToken, refreshToken };
  }
  async refreshToken(refreshToken: string, deviceId: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as any;
      
      
      console.log('Searching for device token with:', {
        refreshToken,
        deviceId,
      });
  
     
      const deviceToken = await this.deviceTokenModel.findOne({
        $and: [
          { refreshToken: refreshToken.toString() },
          { deviceId: deviceId.toString() }
        ]
      }).exec();
  
      console.log('Found deviceToken:', deviceToken);
  
      if (!deviceToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
  
      
      const account = await this.userAccountModel.findById(deviceToken.userId);
      console.log('Found account:', account);
  
      if (!account || !account.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }
  
      
      const payload = {
        id: account.id,
        email: account.email,
        role: account.role,
        _id: account._id
      };
  
      const tokens = this.generateAccessTokens(payload);
  
      
      console.log('Token refresh successful for user:', account.email);
  
      return {
        accessToken: tokens.accessToken,
      };
  
    } catch (error) {
     
      console.error('Token refresh error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
  
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      } else {
        throw new UnauthorizedException('Failed to refresh token');
      }
    }
  }
  

  async logout(refreshToken: string, deviceId: string) {
   
    await this.deviceTokenModel.deleteOne({ refreshToken, deviceId });
  }

  async logoutAllDevices(userId: string) {
    
    await this.deviceTokenModel.deleteMany({ userId });
  }

  async findAllDevices(
    page: number,
    limit: number,
  ): Promise<{ data: DeviceToken[]; total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.deviceTokenModel.find().skip(skip).limit(limit).select('-refreshToken').exec(),
      this.deviceTokenModel.countDocuments(),
    ]);

    return { data, total };
  }


  

  async banUser(userId: number): Promise<UserAccount> {
    const user = await this.userAccountModel.findOne({ id: userId });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === 'admin') {
      throw new BadRequestException('Cannot ban admin users');
    }

    user.isActive = false;
    return user.save();
  }

  async unbanUser(userId: number): Promise<UserAccount> {
    const user = await this.userAccountModel.findOne({ id: userId });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isActive = true;
    return user.save();
  }

  async findOne(id: number): Promise<UserAccount> {
      if (!Number.isInteger(id) || id < 1) {
        throw new BadRequestException('ID must be a positive integer');
      }
  
      const account = await this.userAccountModel.findOne({ id }).exec();
  
      if (!account) {
        throw new NotFoundException(`Personal information with ID ${id} not found`);
      }
  
      return account;
    }
    async update(
      userId: number,
      updateUserDto: UpdateAuthDto,
      currentUserId: number
  ): Promise<Omit<UserAccount, 'password'>> {
     
      if (userId !== currentUserId) {
          throw new UnauthorizedException('You can only update your own profile');
      }
  
      const user = await this.userAccountModel.findOne({ id: userId });
      if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
     
      if (updateUserDto.email) {
          const existingUser = await this.userAccountModel.findOne({
              email: updateUserDto.email,
              id: { $ne: userId }
          });
          if (existingUser) {
              throw new BadRequestException('User with this email already exists');
          }
      }
  
     
      if (updateUserDto.password) {
          if (updateUserDto.password !== updateUserDto.repassword) {
              throw new BadRequestException('Passwords do not match');
          }
          updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
          delete updateUserDto.repassword;
      }
  
      
  
      const updatedUser = await this.userAccountModel
          .findOneAndUpdate(
              { id: userId },
              updateUserDto,
              { new: true }
          )
          .exec();
  
    
      const response = updatedUser.toObject();
      delete response.password;
      return response;
  }

  async remove(userId: number): Promise<void> {
    

    const result = await this.userAccountModel.deleteOne({ id: userId }).exec();

    

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Student with ID ${userId} not found`);
    }
  }

  async findDeviceToken(userId: string) {
   
    console.log('findDeviceToken called with userId:', userId);
  
    try {
     
      const objectId = new Types.ObjectId(userId);
      console.log('Converted userId to ObjectId:', objectId);
  
      
      const results = await this.deviceTokenModel.find({ userId: objectId }).limit(1).exec();
  
      
      console.log('find query result:', results);
  
      
      const deviceToken = results.length > 0 ? results[0] : null;
  
      console.log('Parsed deviceToken:', deviceToken);
      return deviceToken;
    } catch (error) {
      
      console.error('Error occurred in findDeviceToken:', error);
      throw new Error('Database query failed');
    }
  }
  
}