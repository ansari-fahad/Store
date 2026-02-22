const SalesOrder = require('../model/SalesOrder');

exports.createSalesOrder = async (req, res) => {
    try {
        const { orderID, customerName, customerPhone, items, totalAmount, userId, date, paidAmount, paidAmount2, creditAmount, upiID } = req.body;

        const newOrder = new SalesOrder({
            OrderID: orderID,
            CustomerName: customerName,
            CustomerPhone: customerPhone,
            Items: items,
            TotalAmount: totalAmount,
            PaidAmount: paidAmount,
            PaidAmount2: paidAmount2,
            CreditAmount: creditAmount,
            UpiID: upiID,
            CreatedBy: userId,
            OrderDate: date
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: savedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating sales order', error: error.message });
    }
};

exports.getSalesOrders = async (req, res) => {
    try {
        const orders = await SalesOrder.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};
