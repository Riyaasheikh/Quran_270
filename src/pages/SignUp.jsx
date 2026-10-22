import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiArrowLeftLine, 
  RiGoogleFill, 
  RiEyeLine, 
  RiEyeOffLine,
  RiLoader4Line,
  RiUserAddLine,
  RiErrorWarningLine
} from '@remixicon/react';
import api from '../lib/axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',  
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
    setFieldErrors({ ...fieldErrors, [field]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

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
      const errors = err.response?.data?.errors;
      if (errors) {
        const flat = {};
        Object.keys(errors).forEach((k) => { flat[k] = errors[k][0]; });
        setFieldErrors(flat);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDynamicInputClass = (field) =>
    `theme-input text-sm transition-all ${
      fieldErrors[field]
        ? '!border-[var(--danger)] !shadow-[0_0_0_2px_color-mix(in_srgb,var(--danger)_25%,transparent)]'
        : ''
    }`;

  return (
    <div className="theme-page min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 theme-transition relative overflow-hidden">
      
      {/* Ambient Gradient Glows */}
      <div 
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ background: 'var(--gradient-primary)' }}
      />
      <div 
        className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'var(--gradient-gold)' }}
      />

      <div className="w-full max-w-[430px] relative z-10 flex flex-col items-center">
        
        {/* Main Card */}
        <div className="w-full theme-card p-7 sm:p-9 shadow-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-theme-soft border border-theme flex items-center justify-center mx-auto mb-4">
              <RiUserAddLine size={24} className="theme-accent" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight theme-text">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm theme-muted mt-1.5">
              Begin your journey of daily reflection and learning
            </p>
          </div>

          {/* Error Message */}
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Muhammad Ali"
                value={formData.name}
                onChange={handleChange('name')}
                required
                className={getDynamicInputClass('name')}
              />
              {fieldErrors.name && (
                <p className="text-xs mt-1 text-[var(--danger)]">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                required
                className={getDynamicInputClass('email')}
              />
              {fieldErrors.email && (
                <p className="text-xs mt-1 text-[var(--danger)]">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  className={`${getDynamicInputClass('password')} pr-11`}
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
              {fieldErrors.password && (
                <p className="text-xs mt-1 text-[var(--danger)]">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={handleChange('password_confirmation')}
                  required
                  className={`${getDynamicInputClass('password_confirmation')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-subtle hover:theme-secondary transition-colors p-1"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
              {fieldErrors.password_confirmation && (
                <p className="text-xs mt-1 text-[var(--danger)]">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-button w-full !py-3.5 !rounded-xl text-sm font-bold shadow-md mt-2"
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line size={18} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
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

          {/* Google SSO */}
          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:8000/auth/google/redirect'}
            className="theme-button-outline w-full !py-3.5 !rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5"
          >
            <RiGoogleFill size={19} className="text-rose-500" />
            <span>Continue with Google</span>
          </button>

          {/* Switch to Login */}
          <p className="text-xs sm:text-sm theme-muted text-center mt-7">
            Already have an account?{' '}
            <Link to="/login" className="theme-accent font-semibold hover:underline">
              Log in here
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

export default SignUp;