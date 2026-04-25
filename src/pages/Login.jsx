import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError({ type: 'validation', message: 'Please enter email and password' });
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const response = err.response?.data;
      if (response?.code) {
        setError({ type: response.code, message: response.message, reason: response.reason });
      } else {
        setError({ type: 'error', message: response?.message || 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine error style based on type
  const getErrorStyle = () => {
    if (!error) return null;
    if (error.type === 'ACCOUNT_PENDING') {
      return {
        bg: 'bg-[#fff8e1]',
        border: 'border-[#ffe082]',
        text: 'text-[#e65100]',
        icon: 'pending_actions',
        iconColor: 'text-[#f57f17]',
      };
    }
    if (error.type === 'ACCOUNT_REJECTED') {
      return {
        bg: 'bg-error-container',
        border: 'border-[#ef9a9a]',
        text: 'text-on-error-container',
        icon: 'cancel',
        iconColor: 'text-error',
      };
    }
    return {
      bg: 'bg-error-container',
      border: 'border-[#ef9a9a]',
      text: 'text-on-error-container',
      icon: 'error',
      iconColor: 'text-error',
    };
  };

  const errorStyle = getErrorStyle();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo area */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="material-symbols-outlined text-on-primary-container text-[36px]">apartment</span>
            </div>
            <h1 className="text-h1 font-h1 text-on-background">Welcome Back</h1>
            <p className="text-body-md text-on-surface-variant mt-2">Sign in to your SmartPG account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className={`mb-6 p-4 ${errorStyle.bg} border ${errorStyle.border} rounded-lg flex items-start gap-3`}>
              <span
                className={`material-symbols-outlined ${errorStyle.iconColor} flex-shrink-0`}
                style={{ fontSize: '18px' }}
              >
                {errorStyle.icon}
              </span>
              <div>
                <p className={`text-[14px] font-medium ${errorStyle.text}`}>
                  {error.message}
                </p>
                {error.type === 'ACCOUNT_PENDING' && (
                  <p className="text-[12px] text-[#f57f17] mt-1">
                    Your account is under review. Contact your PG admin for faster approval.
                  </p>
                )}
                {error.type === 'ACCOUNT_REJECTED' && (
                  <p className="text-[12px] text-on-error-container mt-1">
                    You can{' '}
                    <Link to="/register" className="underline font-semibold">
                      register again
                    </Link>{' '}
                    or contact admin directly.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow shadow-sm"
              />
            </div>

            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary-container hover:bg-secondary text-on-primary font-label-md py-3.5 rounded-lg transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
                  Sign In
                </>
              )}
            </button>
          </form>


          {/* Register Link */}
          <p className="text-center mt-8 text-body-md text-on-surface-variant">
            New tenant?{' '}
            <Link
              to="/register"
              className="text-secondary-container font-semibold hover:underline"
            >
              Request Access →
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Image/Branding area (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-secondary-container relative items-center justify-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-secondary-container to-[#1a3250] opacity-90"></div>
        
        {/* Glassmorphism content box */}
        <div className="relative z-10 p-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-lg text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30">
            <span className="material-symbols-outlined text-[36px] text-white">domain</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Digital PG Management System</h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            Experience a seamless, transparent, and hassle-free way to manage your PG accommodation. SmartPG handles your rent, complaints, and mess menu in one place.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#81c784]">check_circle</span>
              <span className="font-medium text-white/90">Smart Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#81c784]">check_circle</span>
              <span className="font-medium text-white/90">Instant Updates</span>
            </div>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;
