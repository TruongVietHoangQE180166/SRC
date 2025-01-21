import mongoose from 'mongoose';
import { OrderSchema } from '../order/schemas/order.schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedOrders() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not defined in the environment variables.');
        process.exit(1);
    }

    await mongoose.connect(process.env.DATABASE_URL, {});
    const OrderModel = mongoose.model('Order', OrderSchema);

    console.log('Deleting existing data in the "orders" collection...');
    await OrderModel.deleteMany({});

    console.log('Adding new seed data to the "orders" collection...');
    const orders = [
        {
            id: 1,
            user: new mongoose.Types.ObjectId(),
            products: [
                { product: new mongoose.Types.ObjectId(), quantity: 2 },
                { product: new mongoose.Types.ObjectId(), quantity: 1 },
            ],
            totalAmount: 1499.99,
            status: 'pending',
            orderDate: new Date(),
        },
        {
            id: 2,
            user: new mongoose.Types.ObjectId(),
            products: [
                { product: new mongoose.Types.ObjectId(), quantity: 1 },
                { product: new mongoose.Types.ObjectId(), quantity: 3 },
            ],
            totalAmount: 1999.99,
            status: 'completed',
            orderDate: new Date(),
        },
    ];

    await OrderModel.insertMany(orders);
    console.log('Order data seeding completed successfully.');
    await mongoose.disconnect();
}

seedOrders()
    .then(() => {
        console.log('Database seeding process for orders finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during database seeding:', error);
        process.exit(1);
    });
