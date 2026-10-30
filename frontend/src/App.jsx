import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import BlockchainLedger from './pages/BlockchainLedger';
import Profile from './pages/Profile';
import Beneficiaries from './pages/Beneficiaries';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/send" element={<PrivateRoute><SendMoney /></PrivateRoute>} />
          <Route path="/blockchain-ledger" element={<PrivateRoute><BlockchainLedger /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          {/* 404 redirect - any unknown URL goes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
          <Route path="/beneficiaries" element={<PrivateRoute><Beneficiaries /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;