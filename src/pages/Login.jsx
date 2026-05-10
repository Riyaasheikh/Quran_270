import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RiArrowLeftLine, RiGoogleFill, RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import api from '../lib/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/api/login', { email, password });

      login(res.data.user);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-sans text-[#1f2124]">
      <div className="w-full max-w-[400px] flex flex-col items-center">

        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-center">Welcome back</h3>
        <p className="text-sm text-gray-500 mb-8 text-center">Sign in to your account</p>

        {error && (
          <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2ca4ab] focus:border-[#2ca4ab] transition-all placeholder:text-gray-400"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2ca4ab] focus:border-[#2ca4ab] transition-all placeholder:text-gray-400 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-[#2ca4ab] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#2ca4ab] text-white font-bold rounded-xl hover:bg-[#258d93] transition-colors shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-6 gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Button */}
        <button
          onClick={() => window.location.href = 'http://localhost:8000/auth/google/redirect'}
          className="w-full py-4 border border-gray-300 rounded-xl flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RiGoogleFill size={20} className="text-red-500" />
          Continue with Google
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2ca4ab] font-semibold hover:underline">
            Register here
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

export default Login;