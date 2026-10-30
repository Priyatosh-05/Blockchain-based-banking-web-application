import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaLink, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';

const BlockchainLedger = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch real transactions from your backend
      const response = await axios.get('http://localhost:5001/api/transactions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform transactions to blockchain format
      const blockchainTxs = response.data.map((tx, index) => ({
        id: tx.blockchainLedgerId || index + 1,
        from: tx.from?.username || tx.from?.fullName || 'Unknown',
        to: tx.to?.username || tx.to?.fullName || 'Unknown',
        amount: tx.amount,
        timestamp: tx.createdAt,
        description: tx.description,
        transactionHash: tx.blockchainTxHash,
        verified: tx.blockchainTxHash && tx.blockchainTxHash.startsWith('0x') && tx.blockchainTxHash.length > 50,
        verifyUrl: tx.blockchainTxHash && tx.blockchainTxHash.startsWith('0x') && tx.blockchainTxHash.length > 50
          ? `https://sepolia.etherscan.io/tx/${tx.blockchainTxHash}`
          : null
      }));
      
      setTransactions(blockchainTxs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card">
        <div className="text-center mb-8">
          <FaLink className="text-5xl text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Blockchain Ledger</h2>
          <p className="text-gray-600 mt-2">
            Immutable record of all transactions on the Ethereum Sepolia blockchain
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions recorded on blockchain yet</p>
            <p className="text-sm text-gray-400 mt-2">Send money to see transactions here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{tx.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.from}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      ₹{tx.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {tx.transactionHash ? (
                        <a 
                          href={tx.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {tx.transactionHash.slice(0, 10)}...
                          <FaExternalLinkAlt size={12} />
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tx.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        <FaCheckCircle className="mr-1" /> {tx.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainLedger;