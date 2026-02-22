-- PostgreSQL Schema for Store Management

-- Create extension for UUID if needed (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paid_amount2 DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    upi_id VARCHAR(100),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) -- User ID
);

-- Order Items Table (Linked to Sales Orders)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES sales_orders(order_id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_key INTEGER,
    rate DECIMAL(15, 2) NOT NULL DEFAULT 0,
    qty DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0
);

-- Indices for better performance
CREATE INDEX IF NOT EXISTS idx_order_id ON sales_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_items_order_id ON order_items(order_id);
