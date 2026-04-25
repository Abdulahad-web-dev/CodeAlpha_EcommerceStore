const Cart = require('../models/Cart');

// @desc    Get logged in user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        res.json(cart);
    } else {
        res.json({ cartItems: [] });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
    const { product, name, image, price, qty } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const existItem = cart.cartItems.find(x => x.product.toString() === product);

        if (existItem) {
            existItem.qty = qty;
        } else {
            cart.cartItems.push({ product, name, image, price, qty });
        }
        await cart.save();
        res.status(201).json(cart);
    } else {
        const newCart = await Cart.create({
            user: req.user._id,
            cartItems: [{ product, name, image, price, qty }]
        });
        res.status(201).json(newCart);
    }
};

module.exports = { getCart, addToCart };
