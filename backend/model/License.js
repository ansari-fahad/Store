const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    CompanyName: { type: String, required: true },
    Address: { type: String },
    LogoBase64: { type: String }, // Store logo as base64 or path
    IsLicense: { type: Boolean, default: true },
    Active: { type: Number, default: 1 }
}, { collection: 'License' });

module.exports = mongoose.model('License', LicenseSchema);
