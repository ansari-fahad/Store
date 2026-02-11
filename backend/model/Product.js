const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    ItemKey: { type: Number, required: true },
    ItemName: { type: String, required: true },
    ItemRate: { type: Number, required: true }
}, { collection: 'Product' }); // Explicitly targeting the 'Product' collection

module.exports = mongoose.model('Product', ProductSchema);
