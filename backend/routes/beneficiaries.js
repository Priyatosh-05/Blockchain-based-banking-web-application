const express = require('express');
const User = require('../models/User');
const Beneficiary = require('../models/Beneficiary');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all beneficiaries for logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const beneficiaries = await Beneficiary.find({ user: req.user.userId })
            .sort({ addedAt: -1 });
        
        res.json(beneficiaries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new beneficiary
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { accountNumber, nickname } = req.body;
        
        if (!accountNumber) {
            return res.status(400).json({ message: 'Account number is required' });
        }
        
        // Check if account exists
        const beneficiaryUser = await User.findOne({ accountNumber });
        if (!beneficiaryUser) {
            return res.status(404).json({ message: 'Account number not found' });
        }
        
        // Prevent adding self as beneficiary
        const currentUser = await User.findById(req.user.userId);
        if (currentUser.accountNumber === accountNumber) {
            return res.status(400).json({ message: 'You cannot add yourself as a beneficiary' });
        }
        
        // Check if already in beneficiary list
        const existingBeneficiary = await Beneficiary.findOne({
            user: req.user.userId,
            beneficiaryAccountNumber: accountNumber
        });
        
        if (existingBeneficiary) {
            return res.status(400).json({ message: 'Beneficiary already exists in your list' });
        }
        
        // Create beneficiary
        const beneficiary = new Beneficiary({
            user: req.user.userId,
            beneficiaryAccountNumber: accountNumber,
            beneficiaryName: beneficiaryUser.fullName,
            nickname: nickname || beneficiaryUser.fullName
        });
        
        await beneficiary.save();
        
        res.status(201).json({
            success: true,
            beneficiary: {
                _id: beneficiary._id,
                beneficiaryAccountNumber: beneficiary.beneficiaryAccountNumber,
                beneficiaryName: beneficiary.beneficiaryName,
                nickname: beneficiary.nickname,
                addedAt: beneficiary.addedAt
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove a beneficiary
router.delete('/remove/:id', authMiddleware, async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });
        
        if (!beneficiary) {
            return res.status(404).json({ message: 'Beneficiary not found' });
        }
        
        res.json({ success: true, message: 'Beneficiary removed successfully' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get account details by account number (for verification)
router.post('/verify-account', authMiddleware, async (req, res) => {
    try {
        const { accountNumber } = req.body;
        
        if (!accountNumber) {
            return res.status(400).json({ message: 'Account number is required' });
        }
        
        const user = await User.findOne({ accountNumber });
        if (!user) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json({
            exists: true,
            fullName: user.fullName,
            accountNumber: user.accountNumber
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update last used timestamp when sending money
router.put('/update-last-used/:accountNumber', authMiddleware, async (req, res) => {
    try {
        await Beneficiary.findOneAndUpdate(
            {
                user: req.user.userId,
                beneficiaryAccountNumber: req.params.accountNumber
            },
            { lastUsed: new Date() }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;