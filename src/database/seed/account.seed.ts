import mongoose from 'mongoose';
import { UserAccountSchema } from '../../modules/auth/schemas/account.schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedUserAccounts() {
    
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not defined in the environment variables.');
        process.exit(1);
    }

    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL, {});

    const UserAccountModel = mongoose.model('UserAccount', UserAccountSchema);

    console.log('Deleting existing data in the "useraccounts" collection...');
    await UserAccountModel.deleteMany({});

    console.log('Adding new seed data to the "useraccounts" collection...');
    const users = [
        {
            id: 1,
            email: 'admin@example.com',
            password: await bcrypt.hash('admin123', 10),
            isActive: true,
            role: 'admin'
        },
        {
            id: 2,
            email: 'customer1@example.com',
            password: await bcrypt.hash('customer123', 10),
            isActive: true,
            role: 'user'
        },
        {
            id: 3,
            email: 'customer2@example.com',
            password: await bcrypt.hash('customer123', 10),
            isActive: true,
            role: 'user'
        },
        {
            id: 4,
            email: 'inactive@example.com',
            password: await bcrypt.hash('inactive123', 10),
            isActive: false,
            role: 'user'
        }
    ];

    await UserAccountModel.insertMany(users);
    console.log('Data seeding completed successfully.');

    await mongoose.disconnect();
}

seedUserAccounts()
    .then(() => {
        console.log('Database seeding process finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during database seeding:', error);
        process.exit(1);
    });