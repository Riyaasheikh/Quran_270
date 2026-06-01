import React, {
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  RiGlobalLine,
  RiMenuLine,
  RiSearchLine,
  RiLogoutBoxLine,
  RiUserLine,
  RiBookmarkLine,
} from "@remixicon/react";

import { AuthContext } from "../../context/AuthContext";
import { fetchChapters } from "../../api/quranApi"; // 1. Import your API function
import LanguageModal from "../../ui/LanguageModal";
import SearchModal from "../../ui/SearchModal";
import MenuSidebar from "../../ui/MenuSidebar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chapters, setChapters] = useState([]); 

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
      } catch (error) {
        console.error("Failed to fetch chapters for search:", error);
      }
    };
    getChapters();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const modalOpen = isMenuOpen || isSearchOpen || isLangOpen;
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isMenuOpen, isSearchOpen, isLangOpen]);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsLangOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className=" hover:opacity-80 transition-opacity">
            <span className="text-xl md:text-2xl font-black text-[#C0E2CA] tracking-tighter drop-shadow-sm">
               Deen 360
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-[#8c7355]"
            >
              <RiSearchLine size={22} />
            </button>

            <button
              onClick={() => setIsLangOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-[#8c7355]"
            >
              <RiGlobalLine size={22} />
            </button>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 rounded-full border border-gray-200 bg-white p-1 pr-4 transition hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8c7355] text-sm font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-400">Account</p>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-[120%] z-[300] w-64 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                    <div className="border-b border-gray-100 p-5">
                      <h3 className="font-bold text-gray-900">{user?.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                        <RiUserLine size={18} /> My Profile
                      </Link>
                      <Link to="/bookmarks" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                        <RiBookmarkLine size={18} /> Bookmarks
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 p-2">
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50">
                        <RiLogoutBoxLine size={18} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="rounded-full bg-[#8c7355] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.03] hover:bg-[#24959b]">
                  Sign In
                </button>
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="ml-1 flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-[#8c7355]"
            >
              <RiMenuLine size={24} />
            </button>
          </div>
        </div>
      </nav>

      <MenuSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        allChapters={chapters} 
      />

      <LanguageModal
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
        currentLang={selectedLang}
        onSelectLang={setSelectedLang}
      />
    </>
  );
};

export default Navbar;