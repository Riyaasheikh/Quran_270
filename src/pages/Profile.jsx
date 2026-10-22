import React, { useContext } from 'react';
import { AuthContext } from "../context/AuthContext";
import { Link } from 'react-router-dom';
import { 
  RiUserLine, 
  RiMailLine, 
  RiShieldCheckLine, 
  RiTimeLine,
  RiLoader4Line,
  RiCompass3Line
} from "@remixicon/react";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="theme-page min-h-screen flex flex-col items-center justify-center gap-3">
        <RiLoader4Line className="w-10 h-10 theme-accent animate-spin" />
        <p className="theme-subtle font-bold uppercase tracking-[0.25em] text-[11px]">
          Synchronizing Sanctuary Profile
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center p-4">
        <div className="theme-card max-w-sm w-full p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mx-auto mb-4">
            <RiShieldCheckLine size={28} />
          </div>
          <h2 className="text-xl font-bold theme-text mb-2">Access Restricted</h2>
          <p className="theme-muted text-sm leading-relaxed mb-6">
            Please authenticate to view your personalized profile, notes, and reading history.
          </p>
          <Link to="/login" className="theme-button w-full">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const creationDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Active Member';

  return (
    <div className="theme-page min-h-screen py-12 px-4 sm:px-6 theme-transition safe-area-top safe-area-bottom">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-3">
            
            <span>Account Overview</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight theme-text">
            My Sanctuary Profile
          </h1>
          <p className="theme-muted text-sm mt-2">
            Manage your personal settings and reading preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Identity Column */}
          <div className="md:col-span-1">
            <div className="theme-card p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full border-2 border-accent/40 bg-theme-soft p-1 flex items-center justify-center overflow-hidden shadow-inner">
                  {user.avatar || user.google_avatar ? (
                    <img 
                      src={user.avatar || user.google_avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <RiUserLine size={48} className="theme-subtle opacity-70" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground border-2 border-card flex items-center justify-center shadow-sm">
                  <RiShieldCheckLine size={15} />
                </div>
              </div>

              <h2 className="text-xl font-bold theme-text tracking-tight mb-2">
                {user.name}
              </h2>
              <span className="theme-badge theme-badge-accent uppercase tracking-wider text-[10px] font-bold">
                Quranic Seeker
              </span>

              <div className="w-full mt-6 pt-6 border-t border-theme">
                <Link
                  to="/bookmarks"
                  className="theme-button-outline w-full !py-2.5 text-xs font-semibold gap-1.5"
                >
                  <RiCompass3Line size={15} />
                  <span>My Saved Verses</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Account Detail List */}
          <div className="md:col-span-2 space-y-6">            
            <div className="theme-card p-7 sm:p-8">
              <div className="flex items-center justify-between pb-6 border-b border-theme mb-6">
                <h3 className="text-xs font-bold theme-gold uppercase tracking-[0.25em] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                  Account Credentials
                </h3>
                <span className="text-[11px] font-semibold theme-badge bg-theme-soft">
                  Active Session
                </span>
              </div>

              <div className="space-y-6">
                {/* Email Item */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-theme-soft border border-theme flex items-center justify-center theme-accent shrink-0">
                    <RiMailLine size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold theme-subtle uppercase tracking-wider mb-0.5">
                      Primary Email
                    </p>
                    <p className="font-semibold theme-text text-sm sm:text-base break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Security Verification */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent-soft border border-transparent flex items-center justify-center theme-accent shrink-0">
                    <RiShieldCheckLine size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold theme-subtle uppercase tracking-wider mb-0.5">
                      Authentication
                    </p>
                    <p className="font-semibold theme-text text-sm flex items-center gap-1.5">
                      {user.google_id || user.google_avatar ? 'Connected via Google Account' : 'Email & Password Protected'}
                    </p>
                  </div>
                </div>

                {/* Account Age */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-theme-soft border border-theme flex items-center justify-center theme-gold shrink-0">
                    <RiTimeLine size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold theme-subtle uppercase tracking-wider mb-0.5">
                      Member Since
                    </p>
                    <p className="font-semibold theme-text text-sm">
                      {creationDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Footer Note */}
            <div className="p-4 border-t border-theme/60 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] theme-subtle">
                Deen 360 Sanctuary Platform • Safe & Private
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;