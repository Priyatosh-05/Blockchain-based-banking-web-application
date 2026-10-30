import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaIdCard, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!username) return 'Username is required';
    if (!usernameRegex.test(username)) return '3-20 characters (letters, numbers, underscore only)';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password) return 'Password is required';
    if (!passwordRegex.test(password)) {
      return '8+ chars with 1 uppercase, 1 lowercase, 1 number';
    }
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateFullName = (fullName) => {
    const nameRegex = /^[a-zA-Z\s\.\-]{2,50}$/;
    if (!fullName) return 'Full name is required';
    if (!nameRegex.test(fullName)) return '2-50 characters (letters, spaces, dots, hyphens only)';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Real-time validation
    let error = '';
    switch (name) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
      case 'fullName':
        error = validateFullName(value);
        break;
      default:
        break;
    }
    
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      fullName: validateFullName(formData.fullName)
    };
    
    setErrors(newErrors);
    
    // Check if any errors exist
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', formData);
      
      if (response.data.token) {
        // Save token
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        toast.success('Registration successful!');
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      
      // Handle field-specific errors from backend
      if (error.response?.data?.field === 'username') {
        setErrors({ ...errors, username: error.response.data.message });
        toast.error(error.response.data.message);
      } else if (error.response?.data?.field === 'email') {
        setErrors({ ...errors, email: error.response.data.message });
        toast.error(error.response.data.message);
      } else if (error.response?.data?.field === 'password') {
        setErrors({ ...errors, password: error.response.data.message });
        toast.error(error.response.data.message);
      } else if (error.response?.data?.field === 'fullName') {
        setErrors({ ...errors, fullName: error.response.data.message });
        toast.error(error.response.data.message);
      } else if (error.response?.data?.field === 'confirmPassword') {
        setErrors({ ...errors, confirmPassword: error.response.data.message });
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    return formData.username && 
           formData.email && 
           formData.password && 
           formData.confirmPassword && 
           formData.fullName &&
           !errors.username && 
           !errors.email && 
           !errors.password && 
           !errors.confirmPassword && 
           !errors.fullName;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="card w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <FaUserPlus className="text-5xl text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-2">Join BlockBank today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 mb-2">Full Name *</label>
            <div className="relative">
              <FaIdCard className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
            {!errors.fullName && formData.fullName && (
              <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                <FaCheckCircle /> Valid
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 mb-2">Username *</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Choose a username"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
            {!errors.username && formData.username && (
              <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                <FaCheckCircle /> Available
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">Email *</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
            {!errors.email && formData.email && (
              <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                <FaCheckCircle /> Valid email
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-2">Password *</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Create a password"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            {!errors.password && formData.password && (
              <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                <FaCheckCircle /> Strong password
              </p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 mb-2">Confirm Password *</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Confirm your password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
            {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                <FaCheckCircle /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;