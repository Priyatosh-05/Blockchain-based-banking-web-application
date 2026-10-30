import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaTrash, FaUsers, FaCheckCircle, FaTimesCircle, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    nickname: ''
  });
  const [verifying, setVerifying] = useState(false);
  const [verifiedAccount, setVerifiedAccount] = useState(null);
  const [adding, setAdding] = useState(false);

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
      toast.error('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!formData.accountNumber) {
      toast.error('Please enter account number');
      return;
    }
    
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/beneficiaries/verify-account', 
        { accountNumber: formData.accountNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.exists) {
        setVerifiedAccount(response.data);
        toast.success('Account verified successfully');
      }
    } catch (error) {
      setVerifiedAccount(null);
      toast.error(error.response?.data?.message || 'Account not found');
    } finally {
      setVerifying(false);
    }
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    
    if (!verifiedAccount) {
      toast.error('Please verify the account first');
      return;
    }
    
    setAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/beneficiaries/add', 
        {
          accountNumber: formData.accountNumber,
          nickname: formData.nickname || verifiedAccount.fullName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Beneficiary added successfully');
      setShowAddModal(false);
      setFormData({ accountNumber: '', nickname: '' });
      setVerifiedAccount(null);
      fetchBeneficiaries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveBeneficiary = async (id, name) => {
    if (window.confirm(`Remove ${name} from your beneficiary list?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/beneficiaries/remove/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Beneficiary removed');
        fetchBeneficiaries();
      } catch (error) {
        toast.error('Failed to remove beneficiary');
      }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaUsers /> Beneficiaries
            </h1>
            <p className="text-gray-500 mt-1">Manage your trusted payees</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaUserPlus /> Add Beneficiary
          </button>
        </div>

        {/* Beneficiaries List */}
        {beneficiaries.length === 0 ? (
          <div className="card text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No Beneficiaries Yet</h3>
            <p className="text-gray-400 mt-2">Add your first beneficiary to send money quickly</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <FaUserPlus /> Add Beneficiary
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {beneficiaries.map((beneficiary) => (
              <div key={beneficiary._id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUserCheck className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {beneficiary.nickname || beneficiary.beneficiaryName}
                        </h3>
                        <p className="text-sm text-gray-500">{beneficiary.beneficiaryName}</p>
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          Account: {beneficiary.beneficiaryAccountNumber}
                        </p>
                      </div>
                    </div>
                    {beneficiary.lastUsed && (
                      <p className="text-xs text-gray-400 mt-2">
                        Last used: {new Date(beneficiary.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveBeneficiary(beneficiary._id, beneficiary.nickname || beneficiary.beneficiaryName)}
                    className="text-red-500 hover:text-red-700 transition p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaUserPlus /> Add Beneficiary
            </h2>
            
            <form onSubmit={handleAddBeneficiary}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Account Number *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, accountNumber: e.target.value });
                        setVerifiedAccount(null);
                      }}
                      className="input-field flex-1"
                      placeholder="Enter 12-digit account number"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAccount}
                      disabled={verifying || !formData.accountNumber}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {verifying ? '...' : 'Verify'}
                    </button>
                  </div>
                </div>
                
                {verifiedAccount && (
                  <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">{verifiedAccount.fullName}</p>
                      <p className="text-xs text-green-600">{verifiedAccount.accountNumber}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-gray-700 mb-2">Nickname (Optional)</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Mom, Dad, Friend"
                  />
                  <p className="text-xs text-gray-400 mt-1">If not provided, account holder's name will be used</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ accountNumber: '', nickname: '' });
                    setVerifiedAccount(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !verifiedAccount}
                  className="flex-1 btn-primary py-2 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;