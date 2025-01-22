import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

@Schema({ timestamps: true })
export class UserAccount extends Document {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: UserRole;
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

@Schema({ timestamps: true })
export class DeviceToken extends Document {
  @Prop({ required: true, ref: 'UserAccount' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  lastLogin: Date;

  @Prop({
    type: {
      deviceName: { type: String },
      deviceType: { type: String },
      browser: { type: String },
    },
  })
  deviceInfo: {
    deviceName?: string;
    deviceType?: string;
    browser?: string;
  };
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);
