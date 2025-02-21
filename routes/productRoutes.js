const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  getLowStockProducts,
  deleteProduct,
} = require('../controllers/productController');

// Routes for product management
router.post('/', createProduct);           // Create new product
router.get('/', getProducts);              // Get all products
router.get('/:id', getProductById);        // Get product by ID
router.put('/:id', updateProduct);         // Update product by ID
router.delete('/:id', deleteProduct);      // Delete product by ID
router.get('/low-stock', getLowStockProducts); // Get low stock products

module.exports = router;
