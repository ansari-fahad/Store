const SalesOrderRepo = require('../repository/SalesOrderRepo');

exports.createSalesOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const savedOrder = await SalesOrderRepo.create(orderData);
        res.status(201).json({ message: 'Order created successfully', order: savedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating sales order', error: error.message });
    }
};

exports.getSalesOrders = async (req, res) => {
    try {
        const orders = await SalesOrderRepo.findAll();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};
