import React, { useContext } from 'react';
import { AuthContext } from "../context/AuthContext";
import { 
  RiUserLine, 
  RiMailLine, 
  RiShieldCheckLine, 
  RiTimeLine,
  RiLoader4Line 
} from "@remixicon/react";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center">
        <RiLoader4Line className="w-10 h-10 text-[#8c7355] animate-spin mb-4" />
        <p className="text-[#8c7355] font-black uppercase tracking-[0.3em] text-[10px]">
          Synchronizing Profile
        </p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-[#e8e1d5] rounded-3xl shadow-sm">
          <RiShieldCheckLine className="mx-auto text-red-400 mb-4" size={40} />
          <p className="text-gray-800 font-bold mb-2">Access Denied</p>
          <p className="text-gray-500 text-sm">Please log in to view your profile details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] py-12 px-4">
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-[#8c7355] tracking-tighter uppercase mb-3">
            My Profile
          </h1>
          <div className="flex justify-center items-center gap-4 opacity-30">
            <div className="h-[1px] w-16 bg-[#8c7355]"></div>
            <RiUserLine size={20} className="text-[#8c7355]" />
            <div className="h-[1px] w-16 bg-[#8c7355]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white border-[1.5px] border-[#e8e1d5] rounded-[2.5rem] p-8 shadow-[0_12px_0_0_#e8e1d5] flex flex-col items-center transition-transform hover:scale-[1.02]">
              <div className="w-28 h-28 bg-[#fcfaf7] rounded-full border-2 border-[#8c7355] flex items-center justify-center mb-6 overflow-hidden shadow-inner p-1">
                {user.avatar || user.google_avatar ? (
                  <img 
                    src={user.avatar || user.google_avatar} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <RiUserLine size={48} className="text-[#8c7355] opacity-50" />
                )}
              </div>
              <h2 className="text-2xl font-black text-gray-900 text-center uppercase tracking-tight leading-tight">
                {user.name}
              </h2>
              <p className="text-[10px] font-black text-[#bfa07d] uppercase tracking-[0.25em] mt-2 bg-[#fcfaf7] px-3 py-1 rounded-full">
                Verified Student
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">            
            <div className="bg-white border-[1.5px] border-[#e8e1d5] rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-[11px] font-black text-[#bfa07d] uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#8c7355] rounded-full"></span>
                Account Information
              </h3>

              <div className="space-y-8">
                <div className="flex items-center gap-5 group">
                  <div className="p-3 bg-[#fcfaf7] rounded-2xl text-[#8c7355] transition-colors group-hover:bg-[#8c7355] group-hover:text-white">
                    <RiMailLine size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Email</p>
                    <p className="font-bold text-gray-800 break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="p-3 bg-[#fcfaf7] rounded-2xl text-[#8c7355] transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <RiShieldCheckLine size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Security Status</p>
                    <p className="font-bold text-emerald-600 flex items-center gap-1">
                      Authenticated via Google
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="p-3 bg-[#fcfaf7] rounded-2xl text-[#8c7355] transition-colors group-hover:bg-[#bfa07d] group-hover:text-white">
                    <RiTimeLine size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Created</p>
                    <p className="font-bold text-gray-800">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Subtle Design element */}
            <div className="p-6 border-t border-[#e8e1d5] text-center">
               <p className="text-[9px] font-black text-[#bfa07d] uppercase tracking-[0.4em] opacity-50">
                 Digital Compendium Profile v1.0
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;