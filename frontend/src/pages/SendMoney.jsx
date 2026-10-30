import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaPaperPlane, FaRupeeSign, FaUserCheck, FaUsers, FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SendMoney = () => {
  const { user, setUser } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showBeneficiaryDropdown, setShowBeneficiaryDropdown] = useState(false);
  const [formData, setFormData] = useState({
    toAccountNumber: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/beneficiaries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBeneficiaries(response.data);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectBeneficiary = (beneficiary) => {
    setFormData({
      ...formData,
      toAccountNumber: beneficiary.beneficiaryAccountNumber
    });
    setShowBeneficiaryDropdown(false);
    toast.success(`Selected ${beneficiary.nickname || beneficiary.beneficiaryName}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(formData.amount) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/transactions/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Money sent successfully! Transaction recorded on blockchain');
      
      // Update the current user's balance
      setUser({ ...user, balance: response.data.senderBalance });
      
      // Update last used timestamp for beneficiary
      const beneficiary = beneficiaries.find(b => b.beneficiaryAccountNumber === formData.toAccountNumber);
      if (beneficiary) {
        await axios.put(`http://localhost:5001/api/beneficiaries/update-last-used/${formData.toAccountNumber}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Trigger refresh for transaction history and dashboard
      window.dispatchEvent(new Event('transaction-complete'));
      
      // Clear form but keep beneficiary selection? No, clear all
      setFormData({ toAccountNumber: '', amount: '', description: '' });
      
    } catch (error) {
      console.error('Transaction error:', error);
      const errorMessage = error.response?.data?.message || 'Transaction failed';
      toast.error(errorMessage);
      
      // Clear the account number field if it's a self-transfer error
      if (error.response?.data?.field === 'toAccountNumber') {
        setFormData({ ...formData, toAccountNumber: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <FaPaperPlane className="text-5xl text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Send Money</h2>
            <p className="text-gray-600 mt-2">
              Secure transaction recorded on blockchain
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Beneficiary Selection */}
            <div>
              <label className="block text-gray-700 mb-2">Select Beneficiary (Optional)</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBeneficiaryDropdown(!showBeneficiaryDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-500 transition"
                >
                  <span className="flex items-center gap-2">
                    <FaUsers className="text-gray-400" />
                    {formData.toAccountNumber ? 'Selected account' : 'Choose from saved beneficiaries'}
                  </span>
                  <FaChevronDown className={`text-gray-400 transition-transform ${showBeneficiaryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showBeneficiaryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingBeneficiaries ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : beneficiaries.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No beneficiaries added yet
                      </div>
                    ) : (
                      beneficiaries.map((beneficiary) => (
                        <button
                          key={beneficiary._id}
                          type="button"
                          onClick={() => handleSelectBeneficiary(beneficiary)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition"
                        >
                          <div className="font-semibold">{beneficiary.nickname || beneficiary.beneficiaryName}</div>
                          <div className="text-sm text-gray-500 font-mono">{beneficiary.beneficiaryAccountNumber}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Or enter account number manually below
              </p>
            </div>

            {/* Account Number Input */}
            <div>
              <label className="block text-gray-700 mb-2">Recipient Account Number *</label>
              <div className="relative">
                <FaUserCheck className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="toAccountNumber"
                  value={formData.toAccountNumber}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                  placeholder="Enter account number"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Note: You cannot send money to your own account
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-700 mb-2">Amount (₹)</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Available balance: ₹{user?.balance?.toLocaleString() || 0}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Enter transaction description (optional)"
              />
            </div>

            {/* Blockchain Notice */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                🔒 This transaction will be recorded on the blockchain and cannot be altered
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? 'Processing on Blockchain...' : 'Send Money'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;