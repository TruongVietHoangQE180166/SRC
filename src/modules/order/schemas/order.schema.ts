import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserAccount } from '../../auth/schemas/account.schema';
import { Product } from '../../product/schemas/product.schema';


@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserAccount', required: true })
  user: UserAccount;

  @Prop({
    type: [
      {
        product: { type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    required: true,
  })
  products: {
    product: Product;
    quantity: number;
  }[];

  @Prop({ type: Number, required: true, default: 0 })
  totalAmount: number;

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'cancelled'] })
  status: string;

  @Prop({ type: Date, default: Date.now })
  orderDate: Date;

  @Prop({required: true, unique: true})
  id: number;
  
}

export const OrderSchema = SchemaFactory.createForClass(Order);
