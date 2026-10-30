import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUser, FaEnvelope, FaIdCard, FaPhone, FaCalendarAlt, 
  FaVenusMars, FaLock, FaSave, FaKey, FaCheckCircle, 
  FaTimesCircle, FaUserCircle, FaWallet, FaLink 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile form state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/auth/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        phoneNumber: response.data.phoneNumber || '',
        gender: response.data.gender || '',
        dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Real-time validation
    let error = '';
    if (name === 'newPassword') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(value)) {
        error = '8+ chars, 1 uppercase, 1 lowercase, 1 number';
      }
    }
    if (name === 'confirmPassword') {
      if (value !== passwordData.newPassword) {
        error = 'Passwords do not match';
      }
    }
    setPasswordErrors({ ...passwordErrors, [name]: error });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5001/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setProfile(response.data.user);
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error('Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number');
      return;
    }
    
    setChangingPassword(true);
    try {
      const response = await axios.post('http://localhost:5001/api/auth/change-password', passwordData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setChangingPassword(false);
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
        {/* Profile Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-6xl text-white" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">{profile?.fullName}</h1>
              <p className="text-gray-500">@{profile?.username}</p>
              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Account: {profile?.accountNumber}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  <FaLink size={12} /> Blockchain Verified
                </span>
              </div>
            </div>
            <div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaSave /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaUser /> Personal Information
          </h2>
          
          <form onSubmit={handleProfileSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleProfileChange}
                    disabled={!editing}
                    className={`input-field pl-10 ${!editing ? 'bg-gray-100' : ''}`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={profile?.username}
                    disabled
                    className="input-field pl-10 bg-gray-100"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="input-field pl-10 bg-gray-100"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleProfileChange}
                    disabled={!editing}
                    placeholder="+91 1234567890"
                    className={`input-field pl-10 ${!editing ? 'bg-gray-100' : ''}`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Gender</label>
                <div className="relative">
                  <FaVenusMars className="absolute left-3 top-3 text-gray-400" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleProfileChange}
                    disabled={!editing}
                    className={`input-field pl-10 ${!editing ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Date of Birth</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleProfileChange}
                    disabled={!editing}
                    className={`input-field pl-10 ${!editing ? 'bg-gray-100' : ''}`}
                  />
                </div>
              </div>
            </div>
            
            {editing && (
              <div className="mt-6 flex justify-end">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <FaSave /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Blockchain Info Card */}
        <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaLink /> Blockchain Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="font-mono text-sm">{profile?.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-xl font-bold text-green-600">₹{profile?.balance?.toLocaleString()}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Blockchain Address</p>
              <p className="font-mono text-xs break-all bg-white p-2 rounded border">
                {profile?.blockchainAddress}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle /> Verified on Sepolia Testnet
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <div className="text-center">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 mx-auto"
          >
            <FaLock /> Change Password
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaLock /> Change Password
            </h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`input-field ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    8+ characters, 1 uppercase, 1 lowercase, 1 number
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`input-field ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 btn-primary py-2 disabled:opacity-50"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;