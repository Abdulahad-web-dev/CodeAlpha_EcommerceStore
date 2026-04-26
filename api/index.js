// Vercel serverless function for LuxeStyle API
// This file handles all API endpoints for the e-commerce site

// Error handling wrapper
const handler = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // Route handling
    if (path === '/api/health' && method === 'GET') {
      return res.status(200).json({ 
        status: 'OK', 
        message: 'LuxeStyle API is running',
        timestamp: new Date().toISOString()
      });
    }

    if (path === '/api/products' && method === 'GET') {
      const products = [
        { id: 1, name: "Noir Elegance Blazer", category: "men", price: 289, oldPrice: 420, rating: 4.8, reviews: 124, stock: 5, badge: "NEW", sizes: ["S","M","L","XL"], colors: ["#1A1A1A","#2C3E50"], grad: "g1", desc: "Premium wool blend blazer with satin lapels. Perfect for formal occasions." },
        { id: 2, name: "Velvet Evening Gown", category: "women", price: 349, oldPrice: 499, rating: 4.9, reviews: 89, stock: 8, badge: "BESTSELLER", sizes: ["XS","S","M","L"], colors: ["#8B0000","#000000"], grad: "g2", desc: "Luxurious velvet gown with delicate beadwork. A statement piece." },
        { id: 3, name: "Minimalist Watch", category: "accessories", price: 199, rating: 4.7, reviews: 256, stock: 15, sizes: ["One Size"], colors: ["#C0C0C0","#FFD700"], grad: "g3", desc: "Swiss movement timepiece with genuine leather strap." },
        { id: 4, name: "Silk Scarf", category: "accessories", price: 89, oldPrice: 129, rating: 4.6, reviews: 178, stock: 22, badge: "SALE", sizes: ["One Size"], colors: ["#FF6B6B","#4ECDC4"], grad: "g4", desc: "Hand-rolled silk scarf featuring exclusive artistic prints." },
        { id: 5, name: "Cashmere Overcoat", category: "men", price: 599, oldPrice: 799, rating: 4.9, reviews: 67, stock: 3, badge: "LIMITED", sizes: ["M","L","XL"], colors: ["#8B4513","#000000"], grad: "g5", desc: "Pure cashmere overcoat with classic tailoring." },
        { id: 6, name: "Designer Handbag", category: "women", price: 449, rating: 4.8, reviews: 145, stock: 12, sizes: ["One Size"], colors: ["#000000","#8B4513"], grad: "g6", desc: "Italian leather handbag with gold-tone hardware." },
        { id: 7, name: "Oxford Dress Shoes", category: "men", price: 279, oldPrice: 359, rating: 4.7, reviews: 203, stock: 18, badge: "SALE", sizes: ["8","9","10","11"], colors: ["#000000","#8B4513"], grad: "g1", desc: "Handcrafted leather Oxford shoes." },
        { id: 8, name: "Pleated Midi Skirt", category: "women", price: 159, rating: 4.5, reviews: 134, stock: 25, sizes: ["XS","S","M","L"], colors: ["#000000","#FFB6C1"], grad: "g2", desc: "Flowing pleated midi skirt in premium crepe fabric." },
        { id: 9, name: "Leather Belt", category: "accessories", price: 129, rating: 4.8, reviews: 167, stock: 30, sizes: ["S","M","L"], colors: ["#000000","#8B4513"], grad: "g3", desc: "Genuine leather belt with premium buckle." },
        { id: 10, name: "Silk Blouse", category: "women", price: 189, oldPrice: 259, rating: 4.6, reviews: 98, stock: 14, badge: "NEW", sizes: ["XS","S","M","L"], colors: ["#FFFFFF","#FFE4E1"], grad: "g4", desc: "Elegant silk blouse with delicate details." },
        { id: 11, name: "Wool Sweater", category: "men", price: 179, rating: 4.7, reviews: 156, stock: 20, sizes: ["S","M","L","XL"], colors: ["#4B0082","#000080"], grad: "g5", desc: "Premium merino wool sweater." },
        { id: 12, name: "Evening Clutch", category: "accessories", price: 99, rating: 4.5, reviews: 89, stock: 18, badge: "SALE", sizes: ["One Size"], colors: ["#FFD700","#C0C0C0"], grad: "g6", desc: "Elegant evening clutch with metallic finish." }
      ];
      
      // Handle query parameters for filtering
      const category = url.searchParams.get('category');
      const filteredProducts = category 
        ? products.filter(p => p.category === category)
        : products;
      
      return res.status(200).json(filteredProducts);
    }

    if (path === '/api/cart' && method === 'POST') {
      let body;
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Item added to cart',
        cart: body
      });
    }

    if (path === '/api/auth/login' && method === 'POST') {
      let body;
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
      
      // Mock authentication
      return res.status(200).json({ 
        success: true, 
        token: 'mock_token_' + Date.now(),
        user: { 
          name: 'Test User',
          email: body.email || 'user@luxestyle.com'
        }
      });
    }

    // 404 for unknown routes
    return res.status(404).json({ 
      error: 'Not Found',
      message: `Route ${method} ${path} not found`,
      availableRoutes: [
        'GET /api/health',
        'GET /api/products',
        'POST /api/cart',
        'POST /api/auth/login'
      ]
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
};

// Export for Vercel
module.exports = handler;
