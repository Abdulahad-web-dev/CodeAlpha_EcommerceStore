const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');
const Product = require('./backend/models/Product');
const connectDB = require('./backend/config/db');

dotenv.config();
connectDB();

const products = [
    {
        name: 'Wireless Bluetooth Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        description: 'Premium wireless headphones with noise-canceling technology and 30-hour battery life.',
        brand: 'AudioTech',
        category: 'Electronics',
        price: 199.99,
        countInStock: 15,
        rating: 4.5,
        numReviews: 12,
    },
    {
        name: 'Mechanical Gaming Keyboard',
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80',
        description: 'RGB mechanical keyboard with blue switches for a tactile gaming experience.',
        brand: 'GamerPro',
        category: 'Electronics',
        price: 89.99,
        countInStock: 10,
        rating: 4.8,
        numReviews: 25,
    },
    {
        name: 'Ultra-Wide 4K Monitor',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
        description: '34-inch curved ultra-wide monitor with 4K resolution and 144Hz refresh rate.',
        brand: 'Visionary',
        category: 'Electronics',
        price: 549.99,
        countInStock: 5,
        rating: 4.7,
        numReviews: 8,
    },
    {
        name: 'Ergonomic Office Chair',
        image: 'https://images.unsplash.com/photo-1505798517246-44445853b015?w=500&q=80',
        description: 'Adjustable ergonomic chair designed for long hours of comfortable work.',
        brand: 'ComfortMax',
        category: 'Furniture',
        price: 249.99,
        countInStock: 7,
        rating: 4.6,
        numReviews: 15,
    },
    {
        name: 'Smart Fitness Tracker',
        image: 'https://images.unsplash.com/photo-1557167668-6eb926775714?w=500&q=80',
        description: 'Track your steps, heart rate, and sleep with this sleek waterproof smart band.',
        brand: 'FitSync',
        category: 'Electronics',
        price: 59.99,
        countInStock: 20,
        rating: 4.2,
        numReviews: 40,
    },
    {
        name: 'Leather Messenger Bag',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
        description: 'Genuine leather messenger bag with multiple compartments for laptops and accessories.',
        brand: 'UrbanStyle',
        category: 'Accessories',
        price: 129.99,
        countInStock: 12,
        rating: 4.4,
        numReviews: 10,
    }
];

const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        const createdUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            isAdmin: true
        });

        const sampleProducts = products.map(product => {
            return { ...product, user: createdUser._id };
        });

        await Product.insertMany(sampleProducts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
