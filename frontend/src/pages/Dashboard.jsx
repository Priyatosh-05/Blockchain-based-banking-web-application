import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TransactionHistory from '../components/TransactionHistory';
import { FaWallet, FaQrcode, FaShieldAlt } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [refreshTransactions, setRefreshTransactions] = useState(0);

  const data = [
    { name: 'Jan', amount: 5000 },
    { name: 'Feb', amount: 7500 },
    { name: 'Mar', amount: 6200 },
    { name: 'Apr', amount: 9000 },
    { name: 'May', amount: 8500 },
    { name: 'Jun', amount: 10000 },
  ];

  // Function to refresh user data from backend
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        // Update the user context with fresh data
        setUser(response.data);
        setBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setBalance(user.balance || 0);
    }
  }, [user]);

  // Listen for transaction updates
  useEffect(() => {
    const handleTransaction = async () => {
      // Refresh transaction history
      setRefreshTransactions(prev => prev + 1);
      // Refresh user balance from backend
      await refreshUserData();
    };
    
    window.addEventListener('transaction-complete', handleTransaction);
    return () => window.removeEventListener('transaction-complete', handleTransaction);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-80">Total Balance</p>
              <h2 className="text-3xl font-bold">₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              <p className="text-sm mt-2 opacity-80">Account: {user?.accountNumber}</p>
            </div>
            <FaWallet className="text-5xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-80">Blockchain Address</p>
              <p className="text-sm font-mono mt-1">
                {user?.blockchainAddress?.slice(0, 10)}...
              </p>
              <p className="text-xs mt-2 opacity-80">Secure on Ethereum</p>
            </div>
            <FaShieldAlt className="text-5xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-80">Account Status</p>
              <p className="text-2xl font-bold mt-1">Active</p>
              <p className="text-xs mt-2 opacity-80">Verified ✓</p>
            </div>
            <FaQrcode className="text-5xl opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Account Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <TransactionHistory refreshTrigger={refreshTransactions} currentUserId={user?._id} />
      </div>
    </div>
  );
};

export default Dashboard;