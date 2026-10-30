const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Helper validation functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

const isValidUsername = (username) => {
    // 3-20 characters, letters, numbers, underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

const isValidFullName = (fullName) => {
    // 2-50 characters, letters, spaces, dots, hyphens
    const nameRegex = /^[a-zA-Z\s\.\-]{2,50}$/;
    return nameRegex.test(fullName);
};

// Generate random account number
const generateAccountNumber = () => {
    return 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
};

// Generate a valid Ethereum address (hexadecimal only)
const generateBlockchainAddress = () => {
    const hexChars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
        address += hexChars[Math.floor(Math.random() * 16)];
    }
    return address;
};

// Register with full validation
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword, fullName } = req.body;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                message: 'Passwords do not match',
                field: 'confirmPassword'
            });
        }
        
        // Validate username
        if (!isValidUsername(username)) {
            return res.status(400).json({ 
                message: 'Username must be 3-20 characters (letters, numbers, underscore only)',
                field: 'username'
            });
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                message: 'Please enter a valid email address',
                field: 'email'
            });
        }
        
        // Validate password strength
        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
                field: 'password'
            });
        }
        
        // Validate full name
        if (!isValidFullName(fullName)) {
            return res.status(400).json({ 
                message: 'Full name must be 2-50 characters (letters, spaces, dots, hyphens only)',
                field: 'fullName'
            });
        }
        
        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ 
                message: 'Username already taken. Please choose another.',
                field: 'username'
            });
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ 
                message: 'Email already registered. Please login or use another email.',
                field: 'email'
            });
        }
        
        const accountNumber = generateAccountNumber();
        const blockchainAddress = generateBlockchainAddress();
        
        const user = new User({
            username,
            email,
            password,
            fullName,
            accountNumber,
            blockchainAddress,
            balance: 10000
        });
        
        await user.save();
        
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                accountNumber: user.accountNumber,
                balance: user.balance,
                blockchainAddress: user.blockchainAddress
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                accountNumber: user.accountNumber,
                balance: user.balance,
                blockchainAddress: user.blockchainAddress
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile (name, phone, gender, dob)
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { fullName, phoneNumber, gender, dateOfBirth } = req.body;
        
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (gender) updateData.gender = gender;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }
        
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
            });
        }
        
        // Get user with password
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;