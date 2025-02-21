const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const Order = require('./models/orderModel');
const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const healthRoutes = require('./routes/healthRoutes'); 
const multer = require('multer');
const multerS3 = require('multer-s3-v3');
const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://blossomsbotique.com'],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());

// Use the health check route (accessible at /health)
app.use('/health', healthRoutes);

// Configure AWS S3 client using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Set up multer for handling file uploads to S3 using multer-s3-v3
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: (req, file, cb) => {
      // Explicitly set the content type to file.mimetype (e.g., "image/jpeg")
      cb(null, file.mimetype);
    },
    contentDisposition: 'inline', // Ensure the file is displayed inline
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `products/${Date.now()}-${file.originalname}`);
    },
  })
});

// Apply the upload middleware to product routes
app.use('/api/products', upload.single('image'), productRoutes);
app.use('/api', orderRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Schedule job to update order statuses daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const result = await Order.updateMany(
      {
        "primaryInfo.shippingStatus": { $ne: 'Delivered' },
        "primaryInfo.estimatedDeliveryDate": { $lt: now }
      },
      { $set: { "primaryInfo.shippingStatus": 'Delivered' } }
    );
    console.log(`Updated ${result.modifiedCount} orders to 'Delivered'`);
  } catch (error) {
    console.error('Error updating order statuses:', error);
  }
});
