const mongoose = require('mongoose');

const SalesOrderSchema = new mongoose.Schema({
    OrderID: { type: String, required: true, unique: true },
    CustomerName: { type: String, required: true },
    CustomerPhone: { type: String },
    Items: [{
        ItemName: String,
        ItemKey: Number,
        Rate: Number,
        Qty: Number,
        Total: Number
    }],
    TotalAmount: { type: Number, required: true },
    OrderDate: { type: Date, default: Date.now },
    CreatedBy: { type: String } // User ID
}, { collection: 'SalesOrder' });

module.exports = mongoose.model('SalesOrder', SalesOrderSchema);
