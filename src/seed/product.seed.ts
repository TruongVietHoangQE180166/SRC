import mongoose from 'mongoose';
import { ProductSchema } from '../product/schemas/product.schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function seedProducts() {
    // Check for DATABASE_URL environment variable
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not defined in the environment variables.');
        process.exit(1);
    }

    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL, {});
    const ProductModel = mongoose.model('Product', ProductSchema);

    console.log('Deleting existing data in the "products" collection...');
    await ProductModel.deleteMany({});

    console.log('Adding new seed data to the "products" collection...');
    const products = [
        {
            id: 1,
            name: 'Laptop Gaming Asus ROG',
            price: 1499.99,
            description: 'High-performance gaming laptop with RTX 3080',
            category: 'Electronics',
            stock: 50,
            isActive: true
        },
        {
            id: 2,
            name: 'iPhone 15 Pro',
            price: 999.99,
            description: 'Latest iPhone model with A17 Pro chip',
            category: 'Smartphones',
            stock: 100,
            isActive: true
        },
        {
            id: 3,
            name: 'Sony WH-1000XM4',
            price: 349.99,
            description: 'Premium noise-cancelling headphones',
            category: 'Audio',
            stock: 75,
            isActive: true
        },
        {
            id: 4,
            name: 'Samsung 4K Smart TV',
            price: 799.99,
            description: '55-inch 4K Ultra HD Smart LED TV',
            category: 'Electronics',
            stock: 30,
            isActive: true
        },
        {
            id: 5,
            name: 'iPad Air',
            price: 599.99,
            description: 'Latest iPad Air with M1 chip',
            category: 'Tablets',
            stock: 0,
            isActive: false
        }
    ];

    await ProductModel.insertMany(products);
    console.log('Product data seeding completed successfully.');
    await mongoose.disconnect();
}

seedProducts()
    .then(() => {
        console.log('Database seeding process finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during database seeding:', error);
        process.exit(1);
    });