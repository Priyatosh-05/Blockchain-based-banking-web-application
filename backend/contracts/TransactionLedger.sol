// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionLedger {
    struct Transaction {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string description;
        string transactionHash;
    }
    
    Transaction[] public transactions;
    mapping(uint256 => bool) public transactionExists;
    
    event TransactionRecorded(
        uint256 indexed id,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );
    
    function recordTransaction(
        address _from,
        address _to,
        uint256 _amount,
        string memory _description,
        string memory _transactionHash
    ) public returns (uint256) {
        uint256 transactionId = transactions.length;
        
        transactions.push(Transaction({
            id: transactionId,
            from: _from,
            to: _to,
            amount: _amount,
            timestamp: block.timestamp,
            description: _description,
            transactionHash: _transactionHash
        }));
        
        transactionExists[transactionId] = true;
        
        emit TransactionRecorded(
            transactionId,
            _from,
            _to,
            _amount,
            block.timestamp
        );
        
        return transactionId;
    }
    
    function getTransaction(uint256 _id) public view returns (
        uint256 id,
        address from,
        address to,
        uint256 amount,
        uint256 timestamp,
        string memory description,
        string memory transactionHash
    ) {
        require(transactionExists[_id], "Transaction does not exist");
        Transaction memory t = transactions[_id];
        return (
            t.id,
            t.from,
            t.to,
            t.amount,
            t.timestamp,
            t.description,
            t.transactionHash
        );
    }
    
    function getAllTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
    
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
}