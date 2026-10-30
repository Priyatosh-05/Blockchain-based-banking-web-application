const Web3 = require('web3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const deployContract = async () => {
    try {
        const web3 = new Web3('http://127.0.0.1:8545');
        
        // Get accounts from Ganache
        const accounts = await web3.eth.getAccounts();
        console.log('Deploying from account:', accounts[0]);
        
        // Load compiled contract
        const contractPath = path.join(__dirname, '../artifacts/contracts/TransactionLedger.sol/TransactionLedger.json');
        
        if (!fs.existsSync(contractPath)) {
            console.error('Contract not compiled. Run: npx truffle compile');
            process.exit(1);
        }
        
        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        // Deploy contract
        const contract = new web3.eth.Contract(contractArtifact.abi);
        const deployTx = contract.deploy({
            data: contractArtifact.bytecode
        });
        
        const gas = await deployTx.estimateGas();
        const deployedContract = await deployTx.send({
            from: accounts[0],
            gas: gas
        });
        
        console.log('Contract deployed at address:', deployedContract.options.address);
        
        // Update .env file with contract address
        const envPath = path.join(__dirname, '../.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${deployedContract.options.address}`);
        fs.writeFileSync(envPath, envContent);
        
        console.log('Contract address saved to .env');
        return deployedContract.options.address;
    } catch (error) {
        console.error('Deployment failed:', error);
    }
};

deployContract();