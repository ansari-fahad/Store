require('dotenv').config();
const express = require('express');
const connectDB = require('../config/db');
const userRoutes = require('../router/UserRouter');
const productRoutes = require('../router/ProductRouter');
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MongoDB connected 🚀');
});



const PORT = process.env.PORT || 3000;


app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
