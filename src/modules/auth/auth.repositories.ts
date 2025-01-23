import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { UserAccount, DeviceToken } from './schemas/account.schema';

// Generic Repository Interface
export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: Partial<T>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Base Repository Implementation
abstract class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(entity: Partial<T>): Promise<T> {
    const createdEntity = new this.model(entity);
    return createdEntity.save();
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, entity, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}

// Specific Repositories
@Injectable()
export class UserAccountRepository extends BaseRepository<UserAccount> {
  constructor(@InjectModel(UserAccount.name) userAccountModel: Model<UserAccount>) {
    super(userAccountModel);
  }
}

@Injectable()
export class DeviceTokenRepository extends BaseRepository<DeviceToken> {
  constructor(@InjectModel(DeviceToken.name) deviceTokenModel: Model<DeviceToken>) {
    super(deviceTokenModel);
  }
}
