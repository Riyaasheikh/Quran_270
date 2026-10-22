import React from 'react';
import { Link } from 'react-router-dom';
import { RiBookmarkLine, RiCloseLine, RiLockLine, RiSparklingFill } from '@remixicon/react';

const AuthPromptModal = ({ isOpen, onClose, itemName = "Hadith" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md theme-card p-7 rounded-3xl border border-theme shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 theme-icon-button theme-icon-button-sm cursor-pointer"
          aria-label="Close"
        >
          <RiCloseLine size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mx-auto mb-4 border border-accent/20">
          <RiBookmarkLine size={28} />
        </div>

        <span className="theme-badge theme-badge-gold text-[10px] uppercase font-bold tracking-widest mb-2 inline-flex items-center gap-1">
          <RiLockLine size={12} />
          <span>Sanctuary Authentication</span>
        </span>

        <h3 className="text-xl font-extrabold theme-text tracking-tight mt-1">
          Sign In to Save {itemName}
        </h3>

        <p className="text-xs theme-muted mt-2 leading-relaxed max-w-xs mx-auto">
          Create an account or sign in to sync your reflections, saved verses, and bookmarks across all your devices.
        </p>

        <div className="flex flex-col gap-2.5 mt-6">
          <Link
            to="/login"
            className="theme-button w-full !py-2.5 text-xs font-bold justify-center"
          >
            Sign In to Continue
          </Link>

          <Link
            to="/signup"
            className="theme-button-outline w-full !py-2.5 text-xs font-bold justify-center"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;