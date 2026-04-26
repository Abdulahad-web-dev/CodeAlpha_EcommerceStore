const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'luxestyle.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

// Initialize database tables
const initializeDatabase = () => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    let tablesCreated = 0;
    const totalTables = 7;
    
    // Create categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating categories table:', err);
        else {
            tablesCreated++;
            if (tablesCreated === totalTables) insertSampleData();
        }
    });

    // Create products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        price REAL NOT NULL,
        old_price REAL,
        rating REAL DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 0,
        badge TEXT,
        sizes TEXT,
        colors TEXT,
        gradient TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
    )`, (err) => {
        if (err) console.error('Error creating products table:', err);
        else {
            tablesCreated++;
            if (tablesCreated === totalTables) insertSampleData();
        }
    });

    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating users table:', err);
        else {
            tablesCreated++;
            if (tablesCreated === totalTables) insertSampleData();
        }
    });

    // Create orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        shipping_address TEXT,
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
        if (err) console.error('Error creating orders table:', err);
        else {
            tablesCreated++;
            if (tablesCreated === totalTables) insertSampleData();
        }
    });

    // Create order_items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`, (err) => {
        if (err) console.error('Error creating order_items table:', err);
        else {
            tablesCreated++;
            if (tablesCreated === totalTables) insertSampleData();
        }
    });

    // Create cart table
    db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        UNIQUE(user_id, product_id)
    )`, (err) => {
        if (err) console.error('Error creating cart table:', err);
        else {
            tablesCreated++;
            if (tablesCreated === totalTables) insertSampleData();
        }
    });

    // Create wishlist table
    db.run(`CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        UNIQUE(user_id, product_id)
    )`, (err) => {
        if (err) console.error('Error creating wishlist table:', err);
        else {
            tablesCreated++;
            if (tablesCreated === totalTables) insertSampleData();
        }
    });
};

// Insert sample data
const insertSampleData = () => {
    // Insert categories first
    const categories = [
        ['men', 'Men\'s Fashion'],
        ['women', 'Women\'s Fashion'],
        ['accessories', 'Accessories']
    ];

    let categoriesInserted = 0;
    const totalCategories = categories.length;

    categories.forEach((category, index) => {
        db.run('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)', category, function(err) {
            if (err) {
                console.error('Error inserting category:', err);
            } else {
                categoriesInserted++;
                console.log(`Category ${category[0]} inserted`);
                
                // Insert products after all categories are inserted
                if (categoriesInserted === totalCategories) {
                    insertProducts();
                }
            }
        });
    });
};

// Insert products after categories are created
const insertProducts = () => {
    // Get category IDs first
    db.all('SELECT id, name FROM categories', (err, categories) => {
        if (err) {
            console.error('Error getting categories:', err);
            return;
        }

        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat.id;
        });

        const products = [
            ['Noir Elegance Blazer', 'Premium wool blend blazer with satin lapels. Perfect for formal occasions.', categoryMap['men'], 289, 420, 4.8, 124, 5, 'NEW', 'S,M,L,XL', '#1A1A1A,#2C3E50', 'g1', 'https://picsum.photos/seed/product1/400/400'],
            ['Velvet Evening Gown', 'Luxurious velvet gown with delicate beadwork. A statement piece.', categoryMap['women'], 349, 499, 4.9, 89, 8, 'BESTSELLER', 'XS,S,M,L', '#8B0000,#000000', 'g2', 'https://picsum.photos/seed/product2/400/400'],
            ['Minimalist Watch', 'Swiss movement timepiece with genuine leather strap.', categoryMap['accessories'], 199, null, 4.7, 256, 15, null, 'One Size', '#C0C0C0,#FFD700', 'g3', 'https://picsum.photos/seed/product3/400/400'],
            ['Silk Scarf', 'Hand-rolled silk scarf featuring exclusive artistic prints.', categoryMap['accessories'], 89, 129, 4.6, 178, 22, 'SALE', 'One Size', '#FF6B6B,#4ECDC4', 'g4', 'https://picsum.photos/seed/product4/400/400'],
            ['Cashmere Overcoat', 'Pure cashmere overcoat with classic tailoring.', categoryMap['men'], 599, 799, 4.9, 67, 3, 'LIMITED', 'M,L,XL', '#8B4513,#000000', 'g5', 'https://picsum.photos/seed/product5/400/400'],
            ['Designer Handbag', 'Italian leather handbag with gold-tone hardware.', categoryMap['women'], 449, null, 4.8, 145, 12, null, 'One Size', '#000000,#8B4513', 'g6', 'https://picsum.photos/seed/product6/400/400'],
            ['Oxford Dress Shoes', 'Handcrafted leather Oxford shoes.', categoryMap['men'], 279, 359, 4.7, 203, 18, 'SALE', '8,9,10,11', '#000000,#8B4513', 'g1', 'https://picsum.photos/seed/product7/400/400'],
            ['Pleated Midi Skirt', 'Flowing pleated midi skirt in premium crepe fabric.', categoryMap['women'], 159, null, 4.5, 134, 25, null, 'XS,S,M,L', '#000000,#FFB6C1', 'g2', 'https://picsum.photos/seed/product8/400/400'],
            ['Leather Belt', 'Genuine leather belt with premium buckle.', categoryMap['accessories'], 129, null, 4.8, 167, 30, null, 'S,M,L', '#000000,#8B4513', 'g3', 'https://picsum.photos/seed/product9/400/400'],
            ['Silk Blouse', 'Elegant silk blouse with delicate details.', categoryMap['women'], 189, 259, 4.6, 98, 14, 'NEW', 'XS,S,M,L', '#FFFFFF,#FFE4E1', 'g4', 'https://picsum.photos/seed/product10/400/400'],
            ['Wool Sweater', 'Premium merino wool sweater.', categoryMap['men'], 179, null, 4.7, 156, 20, null, 'S,M,L,XL', '#4B0082,#000080', 'g5', 'https://picsum.photos/seed/product11/400/400'],
            ['Evening Clutch', 'Elegant evening clutch with metallic finish.', categoryMap['accessories'], 99, null, 4.5, 89, 18, 'SALE', 'One Size', '#FFD700,#C0C0C0', 'g6', 'https://picsum.photos/seed/product12/400/400']
        ];

        let productsInserted = 0;
        products.forEach(product => {
            db.run('INSERT OR IGNORE INTO products (name, description, category_id, price, old_price, rating, reviews, stock, badge, sizes, colors, gradient, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', product, function(err) {
                if (err) {
                    console.error('Error inserting product:', err);
                } else {
                    productsInserted++;
                    if (productsInserted === products.length) {
                        console.log('All sample data inserted successfully.');
                        console.log(`Database ready with ${categories.length} categories and ${products.length} products.`);
                    }
                }
            });
        });
    });
};

// Database helper functions
const dbHelpers = {
    // Get all products
    getProducts: (callback) => {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `;
        db.all(query, callback);
    },

    // Get products by category
    getProductsByCategory: (categoryId, callback) => {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ?
            ORDER BY p.created_at DESC
        `;
        db.all(query, [categoryId], callback);
    },

    // Get single product
    getProduct: (productId, callback) => {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        db.get(query, [productId], callback);
    },

    // Get all categories
    getCategories: (callback) => {
        db.all('SELECT * FROM categories ORDER BY name', callback);
    },

    // Add to cart
    addToCart: (userId, productId, quantity, callback) => {
        const query = `
            INSERT OR REPLACE INTO cart (user_id, product_id, quantity)
            VALUES (?, ?, COALESCE((SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?), 0) + ?)
        `;
        db.run(query, [userId, productId, userId, productId, quantity], callback);
    },

    // Get cart items
    getCartItems: (userId, callback) => {
        const query = `
            SELECT c.*, p.name, p.price, p.image_url
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `;
        db.all(query, [userId], callback);
    },

    // Create user
    createUser: (name, email, password, callback) => {
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], callback);
    },

    // Get user by email
    getUserByEmail: (email, callback) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], callback);
    },

    // Close database connection
    close: () => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
};

module.exports = { db, dbHelpers };
