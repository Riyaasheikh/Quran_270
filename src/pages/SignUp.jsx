import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiGoogleFill, RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import api from '../lib/axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',   // Laravel's 'confirmed' rule expects this field name exactly
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setFieldErrors({ ...fieldErrors, [field]: '' }); // clear error on type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side confirm check
    if (formData.password !== formData.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/api/register', formData);

      login(res.data.user);
      navigate('/');
    } catch (err) {
      console.log('Full error:', err.response?.data);
      console.log("Validation Errors:", err.response.data.errors);
      const errors = err.response?.data?.errors;
      if (errors) {
        const flat = {};
        Object.keys(errors).forEach(k => { flat[k] = errors[k][0]; });
        setFieldErrors(flat);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-4 bg-white border rounded-xl focus:outline-none focus:ring-1 transition-all placeholder:text-gray-400 ${
      fieldErrors[field]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-gray-300 focus:ring-[#2ca4ab] focus:border-[#2ca4ab]'
    }`;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-sans text-[#1f2124]">
      <div className="w-full max-w-[400px] flex flex-col items-center">

        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-center">Create account</h3>
        <p className="text-sm text-gray-500 mb-8 text-center">Join us today</p>

        {error && (
          <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              className={inputClass('name')}
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange('email')}
              required
              className={inputClass('email')}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange('password')}
                required
                className={`${inputClass('password')} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={formData.password_confirmation}
                onChange={handleChange('password_confirmation')}
                required
                className={`${inputClass('password_confirmation')} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
              </button>
            </div>
            {fieldErrors.password_confirmation && (
              <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password_confirmation}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#2ca4ab] text-white font-bold rounded-xl hover:bg-[#258d93] transition-colors shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-6 gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button
          onClick={() => window.location.href = 'http://localhost:8000/auth/google/redirect'}
          className="w-full py-4 border border-gray-300 rounded-xl flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RiGoogleFill size={20} className="text-red-500" />
          Continue with Google
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2ca4ab] font-semibold hover:underline">
            Login here
          </Link>
        </p>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 mt-8 text-gray-800 font-semibold hover:opacity-70 transition-opacity"
        >
          <RiArrowLeftLine size={20} />
          <span>Back</span>
        </button>

      </div>
    </div>
  );
};

export default SignUp;