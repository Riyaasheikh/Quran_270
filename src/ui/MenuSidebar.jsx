import React from 'react';
import { Link } from 'react-router-dom';
import {
  RiCloseLine,
  RiPokerDiamondsFill,
  RiHome4Line,
  RiBookOpenLine,
  RiBookmarkLine,
  RiHeadphoneLine,
  RiMicLine,
  RiAppsLine,
  RiCodeSSlashLine,
  RiMoreFill,
  RiGlobalLine,
  RiSunLine,
  RiArrowDownSLine,
} from "@remixicon/react";

const MenuSidebar = ({ isOpen, onClose, user, onLogout }) => {
  const menuItems = [
    { icon: RiHome4Line, label: "Read", to: "/read" },
    { icon: RiBookOpenLine, label: "Learn", to: "/learn" },
    { icon: RiBookmarkLine, label: "Bookmarks", to: "/bookmarks" },
    { icon: RiHeadphoneLine, label: "Quran Radio", to: "/radio" },
    { icon: RiMicLine, label: "Reciters", to: "/reciters" },

  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full max-w-[320px] bg-white z-[120] shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <span className="text-2xl md:text-2xl font-black text-[#8c7355] tracking-tighter drop-shadow-sm">
                      QURAN APP
                    </span>
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="px-4 py-1 border border-red-400 text-red-400 font-bold rounded-full text-sm"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={onClose}>
                <button className="px-4 py-1 border border-[#8c7355] text-[#8c7355] font-bold rounded-full text-sm">
                  Sign in
                </button>
              </Link>
            )}
            <button onClick={onClose}>
              <RiCloseLine size={28} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="overflow-y-auto h-[calc(100%-180px)] p-4 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon; // ← use as component, not JSX literal
            return (
              <Link
                key={index}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors ${item.color || "text-gray-700"}`}
              >
                <Icon className="text-gray-400" size={20} />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}

          
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t space-y-3">
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-full text-sm font-bold hover:bg-gray-50">
              <RiGlobalLine size={18} /> English
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-full text-sm font-bold hover:bg-gray-50">
              <RiSunLine size={18} /> Theme
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default MenuSidebar;