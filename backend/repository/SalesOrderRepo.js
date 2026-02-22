const SalesOrder = require('../model/SalesOrder');
const { getPgPool, dbType } = require('../config/db');

class SalesOrderRepo {
    static async create(orderData) {
        if (dbType === 'mongodb') {
            const newOrder = new SalesOrder({
                OrderID: orderData.orderID,
                CustomerName: orderData.customerName,
                CustomerPhone: orderData.customerPhone,
                Items: orderData.items,
                TotalAmount: orderData.totalAmount,
                PaidAmount: orderData.paidAmount,
                PaidAmount2: orderData.paidAmount2,
                CreditAmount: orderData.creditAmount,
                UpiID: orderData.upiID,
                CreatedBy: orderData.userId,
                OrderDate: orderData.date
            });
            return await newOrder.save();
        } else if (dbType === 'postgresql') {
            const pool = getPgPool();
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Insert Sales Order
                const orderQuery = `
                    INSERT INTO sales_orders 
                    (order_id, customer_name, customer_phone, total_amount, paid_amount, paid_amount2, credit_amount, upi_id, created_by, order_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *;
                `;
                const orderValues = [
                    orderData.orderID,
                    orderData.customerName,
                    orderData.customerPhone,
                    orderData.totalAmount,
                    orderData.paidAmount || 0,
                    orderData.paidAmount2 || 0,
                    orderData.creditAmount || 0,
                    orderData.upiID,
                    orderData.userId,
                    orderData.date
                ];
                const res = await client.query(orderQuery, orderValues);
                const savedOrder = res.rows[0];

                // Insert Items
                for (const item of orderData.items) {
                    const itemQuery = `
                        INSERT INTO order_items (order_id, item_name, item_key, rate, qty, total)
                        VALUES ($1, $2, $3, $4, $5, $6);
                    `;
                    await client.query(itemQuery, [
                        orderData.orderID,
                        item.ItemName,
                        item.ItemKey,
                        item.Rate,
                        item.Qty,
                        item.Total
                    ]);
                }

                await client.query('COMMIT');
                return savedOrder;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }
    }

    static async findAll() {
        if (dbType === 'mongodb') {
            return await SalesOrder.find();
        } else if (dbType === 'postgresql') {
            const pool = getPgPool();
            const res = await pool.query('SELECT * FROM sales_orders ORDER BY order_date DESC');
            return res.rows;
        }
    }

    static async getById(orderId) {
        if (dbType === 'mongodb') {
            return await SalesOrder.findOne({ OrderID: orderId });
        } else if (dbType === 'postgresql') {
            const pool = getPgPool();
            const orderRes = await pool.query('SELECT * FROM sales_orders WHERE order_id = $1', [orderId]);
            if (orderRes.rows.length === 0) return null;

            const order = orderRes.rows[0];
            const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

            // Map PostgreSQL snake_case to Mongoose PascalCase to keep PDF logic working
            return {
                OrderID: order.order_id,
                CustomerName: order.customer_name,
                CustomerPhone: order.customer_phone,
                TotalAmount: parseFloat(order.total_amount),
                PaidAmount: parseFloat(order.paid_amount),
                PaidAmount2: parseFloat(order.paid_amount2),
                CreditAmount: parseFloat(order.credit_amount),
                UpiID: order.upi_id,
                OrderDate: order.order_date,
                Items: itemsRes.rows.map(item => ({
                    ItemName: item.item_name,
                    ItemKey: item.item_key,
                    Rate: parseFloat(item.rate),
                    Qty: parseFloat(item.qty),
                    Total: parseFloat(item.total)
                }))
            };
        }
    }
}

module.exports = SalesOrderRepo;
