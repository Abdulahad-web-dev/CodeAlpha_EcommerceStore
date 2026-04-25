const express = require('express');
const router = express.Router();
const { getCart, addToCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getCart);
router.route('/add').post(protect, addToCart);

module.exports = router;
