import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  RiArrowLeftLine, 
  RiMailSendLine, 
  RiLoader4Line, 
  RiCheckboxCircleLine 
} from '@remixicon/react';
import api from '../lib/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/api/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-page min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 theme-transition relative overflow-hidden">
      
      {/* Background Accent */}
      <div 
        className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'var(--gradient-gold)' }}
      />

      <div className="w-full max-w-[430px] relative z-10 flex flex-col items-center">
        <div className="w-full theme-card p-7 sm:p-9 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-theme-soft border border-theme flex items-center justify-center mx-auto mb-4">
              <RiMailSendLine size={24} className="theme-gold" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight theme-text">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm theme-muted mt-2 leading-relaxed">
              Enter your registered email address and we will forward you instructions to restore access.
            </p>
          </div>

          {error && (
            <div 
              role="alert"
              className="w-full mb-6 p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)',
                color: 'var(--danger)'
              }}
            >
              {error}
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto mb-4">
                <RiCheckboxCircleLine size={32} />
              </div>
              <h3 className="text-lg font-bold theme-text mb-2">Check Your Inbox</h3>
              <p className="text-xs sm:text-sm theme-muted leading-relaxed mb-6">
                We have dispatched password reset directions to <strong className="theme-text">{email}</strong>.
              </p>
              <Link to="/login" className="theme-button w-full !py-3.5 !rounded-xl text-sm font-bold">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold theme-secondary uppercase tracking-wider mb-2">
                  Registered Email
                </label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="theme-input text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="theme-button w-full !py-3.5 !rounded-xl text-sm font-bold shadow-md mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RiLoader4Line size={18} className="animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  'Send Instructions'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-theme text-center">
            <Link to="/login" className="text-xs sm:text-sm theme-accent font-semibold hover:underline">
              Remember your password? Sign in
            </Link>
          </div>
        </div>

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

export default ForgotPassword;