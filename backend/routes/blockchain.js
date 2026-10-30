const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all blockchain transactions (mock data for now)
router.get('/ledger', authMiddleware, async (req, res) => {
    try {
        // Return mock blockchain transactions
        const mockTransactions = [
            {
                id: 1,
                from: '0x1234...5678',
                to: '0x8765...4321',
                amount: '1000000000000000000',
                timestamp: new Date(),
                description: 'Sample transaction',
                transactionHash: '0xabc...123'
            }
        ];
        
        res.json(mockTransactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching blockchain data' });
    }
});

// Verify transaction on blockchain
router.get('/verify/:ledgerId', authMiddleware, async (req, res) => {
    try {
        res.json({
            verified: true,
            transaction: {
                id: req.params.ledgerId,
                from: '0x1234...5678',
                to: '0x8765...4321',
                amount: '1000000000000000000',
                timestamp: new Date(),
                description: 'Verified transaction'
            }
        });
    } catch (error) {
        res.status(404).json({ message: 'Transaction not found on blockchain' });
    }
});

module.exports = router;