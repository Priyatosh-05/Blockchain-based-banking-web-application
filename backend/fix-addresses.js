const mongoose = require('mongoose');
const User = require('./models/User');

// Use the REAL address from your backend (lowercase to avoid checksum issues)
const YOUR_REAL_ADDRESS = '0x0fb0a5f09bfa54d4bb702043713a794d81aa340e';

async function fixAddresses() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/banking_blockchain');
        console.log('✅ Connected to MongoDB\n');
        
        // Get all users
        const users = await User.find();
        console.log(`Found ${users.length} users\n`);
        
        // Update each user
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const oldAddress = user.blockchainAddress;
            
            // Generate a valid Ethereum address (42 chars total: 0x + 40 hex chars)
            // All lowercase to avoid checksum issues
            const suffix = i.toString(16).padStart(2, '0');
            const newAddress = YOUR_REAL_ADDRESS.slice(0, 40) + suffix;
            
            user.blockchainAddress = newAddress;
            await user.save();
            console.log(`✅ Updated ${user.username}:`);
            console.log(`   Old: ${oldAddress}`);
            console.log(`   New: ${newAddress}\n`);
        }
        
        // Verify all addresses are valid
        const updatedUsers = await User.find();
        console.log('📋 Verification:');
        updatedUsers.forEach(u => {
            // Check if it's 42 chars and starts with 0x
            const isValid = u.blockchainAddress.length === 42 && u.blockchainAddress.startsWith('0x');
            console.log(`   ${u.username}: ${u.blockchainAddress} → ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        });
        
        console.log('\n🎉 All addresses fixed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

fixAddresses();