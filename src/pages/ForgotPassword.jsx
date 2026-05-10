import React from 'react';
import { RiArrowLeftLine } from '@remixicon/react';


const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-sans text-[#1f2124]">

      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">
          Forgot password?
        </h3>

        {/* Instructions */}
        <p className="text-sm text-center text-gray-600 mb-8 leading-relaxed">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {/* Form Container */}
        <div className="w-full space-y-4">
          <input 
            type="email" 
            placeholder="Email address"
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2ca4ab] focus:border-[#2ca4ab] transition-all placeholder:text-gray-400"
          />

          <button className="w-full py-4 bg-[#2ca4ab] text-white font-bold rounded-xl hover:bg-[#258d93] transition-colors shadow-sm">
            Confirm
          </button>
        </div>

        {/* Back Button */}
        <button className="flex items-center justify-center gap-2 mt-12 text-gray-800 font-semibold hover:opacity-70 transition-opacity">
          <RiArrowLeftLine size={20}/>
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;