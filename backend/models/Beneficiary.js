const mongoose = require('mongoose');

const BeneficiarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    beneficiaryAccountNumber: {
        type: String,
        required: true,
        trim: true
    },
    beneficiaryName: {
        type: String,
        required: true,
        trim: true
    },
    nickname: {
        type: String,
        trim: true,
        default: ''
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: null
    }
});

// Ensure a user cannot add the same beneficiary twice
BeneficiarySchema.index({ user: 1, beneficiaryAccountNumber: 1 }, { unique: true });

module.exports = mongoose.model('Beneficiary', BeneficiarySchema);