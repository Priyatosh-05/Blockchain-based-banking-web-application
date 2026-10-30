const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    accountNumber: { type: String, unique: true, required: true },
    balance: { type: Number, default: 10000, min: 0 },
    blockchainAddress: { type: String, required: true },
    // New profile fields
    phoneNumber: { type: String, default: '', trim: true },
    gender: { type: String, enum: ['', 'Male', 'Female', 'Other'], default: '' },
    dateOfBirth: { type: Date, default: null },
    avatar: { type: String, default: '' }, // For future avatar upload
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);