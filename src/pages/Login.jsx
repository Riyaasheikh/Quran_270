import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  RiArrowLeftLine, 
  RiGoogleFill, 
  RiEyeLine, 
  RiEyeOffLine, 
  RiLoader4Line, 
  RiShieldCheckLine,
  RiErrorWarningLine
} from '@remixicon/react';
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
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-page min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 theme-transition relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div 
        className="absolute top-1/4 -right-24 w-80 h-80 rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ background: 'var(--gradient-primary)' }}
      />
      <div 
        className="absolute bottom-1/4 -left-24 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'var(--gradient-gold)' }}
      />

      <div className="w-full max-w-[430px] relative z-10 flex flex-col items-center">
        
        {/* Card Container */}
        <div className="w-full theme-card p-7 sm:p-9 shadow-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-theme-soft border border-theme flex items-center justify-center mx-auto mb-4">
              <RiShieldCheckLine size={24} className="theme-accent" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight theme-text">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm theme-muted mt-1.5">
              Sign in to sync your recitations and bookmarks
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div 
              role="alert"
              className="w-full mb-6 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)',
                color: 'var(--danger)'
              }}
            >
              <RiErrorWarningLine size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="theme-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold theme-secondary uppercase tracking-wider">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs theme-accent font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="theme-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-subtle hover:theme-secondary transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-button w-full !py-3.5 !rounded-xl text-sm font-bold shadow-md mt-2"
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center w-full my-6 gap-3">
            <div className="theme-divider flex-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider theme-subtle">
              or
            </span>
            <div className="theme-divider flex-1" />
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:8000/auth/google/redirect'}
            className="theme-button-outline w-full !py-3.5 !rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5"
          >
            <RiGoogleFill size={19} className="text-rose-500" />
            <span>Continue with Google</span>
          </button>

          {/* Signup Switcher */}
          <p className="text-xs sm:text-sm theme-muted text-center mt-7">
            Don't have an account?{' '}
            <Link to="/signup" className="theme-accent font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 mt-6 theme-muted hover:theme-text text-sm font-medium transition-colors"
        >
          <RiArrowLeftLine size={18} />
          <span>Return to previous page</span>
        </button>

      </div>
    </div>
  );
};

export default Login;