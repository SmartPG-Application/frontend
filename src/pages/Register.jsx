import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { tenantService } from '../services/tenantService';
import FormInput from '../components/common/FormInput';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emergencyContact: '',
    idProofType: 'Aadhar',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit Indian phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await tenantService.selfRegister({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        emergencyContact: formData.emergencyContact.trim(),
        idProofType: formData.idProofType,
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS STATE ─────────────────────────────────────────
  if (submitted) {
      <div className="min-h-screen bg-background flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">

            {/* Success Icon */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-[#e8f5e9] flex items-center justify-center mb-6 shadow-sm border border-[#c8e6c9]">
                <span
                  className="material-symbols-outlined text-[#2e7d32]"
                  style={{ fontSize: '56px', fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h2 className="text-h1 font-h1 text-on-background">
                Application Submitted!
              </h2>
              <p className="text-body-md text-on-surface-variant mt-3 max-w-sm">
                Your account request has been sent to the admin for review.
                You will be notified once approved.
              </p>
            </div>

            {/* What happens next */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant mb-6 shadow-sm">
              <p className="font-label-md text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '20px' }}>
                  info
                </span>
                What happens next?
              </p>
              <div className="flex flex-col gap-4">
                {[
                  'Admin reviews your application',
                  'Admin verifies your ID proof',
                  'Admin assigns you a room',
                  'You receive an approval notification',
                  'Login with your registered email & password',
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container text-[12px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm border border-primary-container">
                      {index + 1}
                    </div>
                    <p className="text-[14px] text-on-surface font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated time */}
            <div className="flex items-start gap-3 p-4 bg-[#fff8e1] rounded-xl border border-[#ffe082] mb-8 shadow-sm">
              <span className="material-symbols-outlined text-[#f57f17]" style={{ fontSize: '20px' }}>
                schedule
              </span>
              <p className="text-[13px] text-[#e65100] leading-relaxed">
                Approval usually takes <strong>24-48 hours</strong>.
                The admin will verify your details physically before approving the digital account.
              </p>
            </div>

            {/* Back to login */}
            <Link
              to="/login"
              className="block w-full text-center py-3.5 border-2 border-secondary-container text-secondary-container font-label-md rounded-lg hover:bg-secondary-container hover:text-white transition-colors shadow-sm"
            >
              Return to Login
            </Link>
          </div>
        </div>

        {/* Right side: Image/Branding area (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 bg-secondary-container relative items-center justify-center overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#1a3250] to-secondary-container opacity-90"></div>
          
          <div className="relative z-10 p-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-lg text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30">
              <span className="material-symbols-outlined text-[36px] text-white">verified_user</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">Secure & Transparent</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Create an account to track your rent payments, view the mess menu, and log complaints directly with your admin.
            </p>
            <div className="flex gap-4 flex-col">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#81c784] bg-white/10 p-1 rounded-full">receipt_long</span>
                <span className="font-medium text-white/90">Digital Rent Receipts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#81c784] bg-white/10 p-1 rounded-full">support_agent</span>
                <span className="font-medium text-white/90">Quick Complaint Resolution</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#81c784] bg-white/10 p-1 rounded-full">restaurant_menu</span>
                <span className="font-medium text-white/90">Daily Mess Menu</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/4 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        </div>
      </div>
  }

  // ── REGISTRATION FORM ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-lg">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span
                className="material-symbols-outlined text-on-primary-container"
                style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}
              >
                apartment
              </span>
            </div>
            <h1 className="text-h1 font-h1 text-on-background">
              Join SmartPG
            </h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              Request tenant account access
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-6 p-4 bg-error-container rounded-lg border border-[#ef9a9a] flex items-start gap-3 shadow-sm">
              <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: '18px' }}>
                error
              </span>
              <p className="text-[14px] text-on-error-container font-medium">
                {apiError}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* Full Name */}
              <FormInput
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                error={errors.name}
              />

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  error={errors.email}
                />
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  error={errors.phone}
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <FormInput
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    error={errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <FormInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    error={errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-[34px] text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Emergency Contact & ID Proof */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Emergency Contact (Optional)"
                  name="emergencyContact"
                  type="text"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Parent/Guardian number"
                />
                <div>
                  <label className="font-label-md text-on-surface mb-1.5 block">
                    ID Proof Type
                  </label>
                  <select
                    name="idProofType"
                    value={formData.idProofType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow shadow-sm"
                  >
                    <option value="Aadhar">Aadhar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="DrivingLicense">Driving License</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant flex items-start gap-3 shadow-sm">
              <span className="material-symbols-outlined text-secondary-container flex-shrink-0" style={{ fontSize: '20px' }}>
                info
              </span>
              <div>
                <p className="font-label-md text-on-surface mb-0.5">
                  Pending Approval Required
                </p>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  Your account will be reviewed by the admin before you
                  can login. This usually takes 24-48 hours. You will
                  need to physically present your ID proof to the admin.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-secondary-container hover:bg-secondary text-on-primary font-label-md py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    how_to_reg
                  </span>
                  Request Account Access
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-secondary-container font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Image/Branding area (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-secondary-container relative items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#1a3250] to-secondary-container opacity-90"></div>
        
        <div className="relative z-10 p-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-lg text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30">
            <span className="material-symbols-outlined text-[36px] text-white">verified_user</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Secure & Transparent</h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            Create an account to track your rent payments, view the mess menu, and log complaints directly with your admin.
          </p>
          <div className="flex gap-4 flex-col">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#81c784] bg-white/10 p-1 rounded-full">receipt_long</span>
              <span className="font-medium text-white/90">Digital Rent Receipts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#81c784] bg-white/10 p-1 rounded-full">support_agent</span>
              <span className="font-medium text-white/90">Quick Complaint Resolution</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#81c784] bg-white/10 p-1 rounded-full">restaurant_menu</span>
              <span className="font-medium text-white/90">Daily Mess Menu</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Register;
