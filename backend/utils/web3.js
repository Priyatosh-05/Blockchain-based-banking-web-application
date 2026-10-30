const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let provider;
let contract;
let contractAddress;
let signer;

const initWeb3 = async () => {
    try {
        const rpcUrl = process.env.BLOCKCHAIN_NETWORK;
        
        if (!rpcUrl) {
            console.log('⚠️ BLOCKCHAIN_NETWORK not set');
            return { provider: null, contract: null, contractAddress: null };
        }
        
        // Connect to Sepolia via Alchemy
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        contractAddress = process.env.CONTRACT_ADDRESS;
        
        // Check if private key is available for signing transactions
        const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
        if (privateKey && privateKey !== '') {
            signer = new ethers.Wallet(privateKey, provider);
            console.log('✅ Signer configured for blockchain transactions');
        } else {
            console.log('⚠️ No private key - transactions will be read-only');
        }
        
        console.log(`🔗 Connected to Sepolia via Alchemy`);
        
        if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
            // Look in the build folder (where truffle puts compiled contracts)
            const contractPath = path.join(__dirname, '../build/contracts/TransactionLedger.json');
            
            if (fs.existsSync(contractPath)) {
                const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                // Use signer if available, otherwise just provider
                const signerOrProvider = signer || provider;
                contract = new ethers.Contract(contractAddress, contractJson.abi, signerOrProvider);
                console.log('✅ Contract loaded successfully');
                console.log(`📄 Contract Address: ${contractAddress}`);
                console.log(`🔗 View: https://sepolia.etherscan.io/address/${contractAddress}`);
            } else {
                console.log('⚠️ Contract ABI not found at:', contractPath);
            }
        } else {
            console.log('⚠️ CONTRACT_ADDRESS not set in .env');
        }
        
        return { provider, contract, contractAddress, signer };
    } catch (error) {
        console.error('Blockchain connection error:', error.message);
        return { provider: null, contract: null, contractAddress: null, signer: null };
    }
};

const getContract = () => contract;
const getProvider = () => provider;
const getSigner = () => signer;

module.exports = { initWeb3, getContract, getProvider, getSigner };