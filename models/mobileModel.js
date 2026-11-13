
const mongoose = require('mongoose');

const mobileSchema = new mongoose.Schema(
    {
        phoneName: {
            type: String,
            required: true,
            trim: true
        },
        brand: {
            type: String,
            required: true,
            trim: true
        },
        IMEI: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\d{15}$/, 'IMEI must contain exactly 15 digits']
        },
        actualPrice: {
            type: Number,
            required: true,
            min: [1, 'Price must be greater than zero']
        },
        image: {
            type: String,
            required: true
        },
        imagePublicId: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['Available', 'Sold'],
            default: 'Available'
        }
    },
    { timestamps: true }
);

const Mobile = mongoose.model('Mobile', mobileSchema);

module.exports = Mobile;
