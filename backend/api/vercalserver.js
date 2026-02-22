require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("../router/UserRouter");
const productRoutes = require("../router/ProductRouter");
const customerRoutes = require("../router/CustomerRouter");
const salesOrderRoutes = require("../router/SalesOrderRouter");
const invoiceRoutes = require("../router/InvoiceRouter");
const invoiceImageRoutes = require("../router/InvoiceImageRouter");
const urlShortenerRoutes = require("../router/UrlShortenerRouter");

const { connectDB } = require("../config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Connect DB when any request comes (handles both Mongo and Postgres)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).send("Database connection error");
  }
});

app.get("/", (req, res) => {
  res.send("MongoDB connected 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/salesorders", salesOrderRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/invoice-image", invoiceImageRoutes);
app.use("/api/url", urlShortenerRoutes);

module.exports = app;
