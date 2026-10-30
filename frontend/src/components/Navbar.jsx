import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaMoneyBillWave, FaSignOutAlt, FaUser, FaHome, FaExchangeAlt, FaLink, FaUserCircle, FaUsers } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <FaMoneyBillWave className="text-3xl text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BlockBank
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <FaHome />
              <span>Dashboard</span>
            </Link>
            <Link to="/send" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <FaExchangeAlt />
              <span>Send Money</span>
            </Link>
            <Link to="/blockchain-ledger" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <FaLink />
              <span>Blockchain Ledger</span>
            </Link>
            <Link to="/beneficiaries" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <FaUsers />
              <span>Beneficiaries</span>
            </Link>
            <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <FaUserCircle />
              <span>Profile</span>
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Welcome,</div>
              <div className="font-semibold text-gray-800">{user.fullName}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;