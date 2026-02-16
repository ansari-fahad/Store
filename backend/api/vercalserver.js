require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("../router/UserRouter");
const productRoutes = require("../router/ProductRouter");
const customerRoutes = require("../router/CustomerRouter");

const app = express();

app.use(cors());
app.use(express.json());

// Serverless-safe DB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// Connect DB when any request comes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/", (req, res) => {
  res.send("MongoDB connected 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);

module.exports = app;
