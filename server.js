const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/db');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Route imports
const authRoutes = require('./backend/routes/authRoutes');
const productRoutes = require('./backend/routes/productRoutes');
const cartRoutes = require('./backend/routes/cartRoutes');
const orderRoutes = require('./backend/routes/orderRoutes');

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA-like behavior or just serve index
// Fallback to index.html for SPA-like behavior
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
