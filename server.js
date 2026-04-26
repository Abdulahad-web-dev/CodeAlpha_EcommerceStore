const express = require('express');
const path = require('path');
const cors = require('cors');
const { db, dbHelpers } = require('./database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files serving
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'LuxeStyle API is running', database: 'SQLite' });
});

// Get all products
app.get('/api/products', (req, res) => {
    const category = req.query.category;
    
    if (category) {
        // Get products by category name
        db.get('SELECT id FROM categories WHERE name = ?', [category], (err, categoryRow) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (categoryRow) {
                dbHelpers.getProductsByCategory(categoryRow.id, (err, products) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json(products);
                });
            } else {
                res.json([]);
            }
        });
    } else {
        // Get all products
        dbHelpers.getProducts((err, products) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(products);
        });
    }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    dbHelpers.getProduct(productId, (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    });
});

// Get all categories
app.get('/api/categories', (req, res) => {
    dbHelpers.getCategories((err, categories) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(categories);
    });
});

// Add to cart
app.post('/api/cart', (req, res) => {
    const { userId, productId, quantity } = req.body;
    
    if (!userId || !productId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    dbHelpers.addToCart(userId, productId, quantity, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, message: 'Item added to cart' });
    });
});

// Get cart items
app.get('/api/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    
    dbHelpers.getCartItems(userId, (err, cartItems) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(cartItems);
    });
});

// User registration
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already exists
    dbHelpers.getUserByEmail(email, (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Create new user
        dbHelpers.createUser(name, email, password, function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, message: 'User created successfully' });
        });
    });
});

// User login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }
    
    dbHelpers.getUserByEmail(email, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        res.json({ 
            success: true, 
            token: 'mock_token_' + Date.now(),
            user: { 
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`LuxeStyle server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to view the application`);
    console.log(`Database: SQLite (local)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    dbHelpers.close();
    process.exit(0);
});
