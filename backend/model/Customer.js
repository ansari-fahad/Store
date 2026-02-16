const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    ID: { type: Number, required: true },
    Name: { type: String, required: true },
    Phone1: { type: String, required: true },
    PendingAmount: { type: Number, default: 0.00 }
}, { collection: 'Customer' });

module.exports = mongoose.model('Customer', CustomerSchema);
