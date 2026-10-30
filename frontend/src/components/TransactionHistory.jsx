import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown, FaExternalLinkAlt } from 'react-icons/fa';

const TransactionHistory = ({ refreshTrigger, currentUserId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/transactions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if current user is sender or receiver
  const getTransactionType = (tx) => {
    if (tx.from?._id === currentUserId) {
      return 'sent';
    } else if (tx.to?._id === currentUserId) {
      return 'received';
    }
    return 'unknown';
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          transactions.map((tx) => {
            const type = getTransactionType(tx);
            const isSent = type === 'sent';
            const otherPerson = isSent ? tx.to : tx.from;
            
            // Check if this is a real blockchain transaction
            const isRealBlockchain = tx.blockchainTxHash && 
                                     tx.blockchainTxHash.startsWith('0x') && 
                                     tx.blockchainTxHash.length > 50;
            const etherscanUrl = isRealBlockchain 
              ? `https://sepolia.etherscan.io/tx/${tx.blockchainTxHash}` 
              : null;
            
            return (
              <div key={tx._id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${isSent ? 'bg-red-100' : 'bg-green-100'}`}>
                      {isSent ? (
                        <FaArrowUp className="text-red-500" />
                      ) : (
                        <FaArrowDown className="text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {isSent ? 'Sent to: ' : 'Received from: '}
                        {otherPerson?.fullName || otherPerson?.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">{tx.description}</p>
                      <p className="text-xs text-gray-400">
                        Blockchain ID: {tx.blockchainLedgerId}
                      </p>
                      {etherscanUrl && (
                        <a 
                          href={etherscanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1"
                        >
                          <FaExternalLinkAlt size={10} /> Verify on Etherscan
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                      {isSent ? '-' : '+'} ₹{tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;