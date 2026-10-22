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
  RiArrowDownSLine,
} from "@remixicon/react";

import { AuthContext } from "../../context/AuthContext";
import { fetchChapters } from "../../api/quranApi";

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

  /* -----------------------------------------------------------
     FETCH CHAPTERS FOR SEARCH
  ----------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const getChapters = async () => {
      try {
        const data = await fetchChapters();

        if (mounted) {
          setChapters(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(
          "Failed to fetch chapters for search:",
          error
        );

        if (mounted) {
          setChapters([]);
        }
      }
    };

    getChapters();

    return () => {
      mounted = false;
    };
  }, []);

  /* -----------------------------------------------------------
     CLOSE PROFILE WHEN CLICKING OUTSIDE
  ----------------------------------------------------------- */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* -----------------------------------------------------------
     PREVENT BODY SCROLL WHEN DRAWERS / MODALS ARE OPEN
  ----------------------------------------------------------- */

  useEffect(() => {
    const modalOpen =
      isMenuOpen ||
      isSearchOpen ||
      isLangOpen;

    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isMenuOpen,
    isSearchOpen,
    isLangOpen,
  ]);

  /* -----------------------------------------------------------
     CLOSE NAVIGATION UI ON ROUTE CHANGE
  ----------------------------------------------------------- */

  useEffect(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsLangOpen(false);
  }, [location.pathname]);

  /* -----------------------------------------------------------
     LOGOUT
  ----------------------------------------------------------- */

  const handleLogout = async () => {
    try {
      await logout();

      setIsProfileOpen(false);

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* -----------------------------------------------------------
     ACTIVE ROUTE
  ----------------------------------------------------------- */

  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */

  const navItems = [
    {
      label: "Quran",
      path: "/quran",
    },
    {
      label: "Hadith",
      path: "/hadith",
    },
    {
      label: "Prayer Times",
      path: "/prayer-times",
    },
    {
      label: "Supplications",
      path: "/supplications",
    },
  ];

  /* -----------------------------------------------------------
     USER INITIAL
  ----------------------------------------------------------- */

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav
        className="
          sticky top-0 z-40 w-full
          border-b border-theme
          bg-theme
          theme-transition
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[72px]
            w-full
            max-w-7xl
            items-center
            justify-between
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            to="/"
            aria-label="Deen 360 Home"
            className="
              group
              flex
              shrink-0
              items-center
              gap-2
              outline-none
            "
          >
            <div
              className="
                flex
                items-center
                gap-0.5
                text-xl
                font-extrabold
                tracking-[-0.04em]
                transition-transform
                duration-300
                group-hover:scale-[1.02]
                sm:text-2xl
              "
            >
              <span className="theme-gold">
                Deen
              </span>

              <span className="theme-text font-light">
                360
              </span>
            </div>

            {/* Small decorative dot */}
            <span
              className="
                mt-[-14px]
                h-1.5
                w-1.5
                rounded-full
                bg-gold
                opacity-80
              "
            />
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div
            className="
              hidden
              items-center
              gap-1
              lg:flex
            "
          >
            {navItems.map((item) => {
              const active = isActiveRoute(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group
                    relative
                    flex
                    h-10
                    items-center
                    rounded-xl
                    px-4
                    text-sm
                    font-medium
                    tracking-[-0.01em]
                    outline-none
                    transition-all
                    duration-200

                    ${
                      active
                        ? "theme-accent bg-accent-soft"
                        : "theme-secondary hover:bg-theme-card hover:theme-text"
                    }
                  `}
                >
                  {item.label}

                  {/* Active indicator */}
                  <span
                    className={`
                      absolute
                      bottom-1.5
                      left-1/2
                      h-[2px]
                      -translate-x-1/2
                      rounded-full
                      bg-accent
                      transition-all
                      duration-300

                      ${
                        active
                          ? "w-5 opacity-100"
                          : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-60"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </div>

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-1
              sm:gap-1.5
            "
          >
            {/* -----------------------------------------------
                SEARCH
            ----------------------------------------------- */}

            <button
              type="button"
              aria-label="Search Quran"
              aria-haspopup="dialog"
              onClick={() => setIsSearchOpen(true)}
              className="
                theme-icon-button
                theme-transition
              "
            >
              <RiSearchLine size={19} />
            </button>

            {/* -----------------------------------------------
                LANGUAGE
            ----------------------------------------------- */}

            <button
              type="button"
              aria-label="Change language"
              aria-haspopup="dialog"
              onClick={() => setIsLangOpen(true)}
              className="
                theme-icon-button
                theme-transition
              "
            >
              <RiGlobalLine size={19} />
            </button>

            {/* -----------------------------------------------
                PROFILE
            ----------------------------------------------- */}

            {user ? (
              <div
                ref={profileRef}
                className="
                  relative
                  ml-1
                "
              >
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileOpen}
                  onClick={() =>
                    setIsProfileOpen((current) => !current)
                  }
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-theme
                    bg-theme-card
                    p-1
                    pr-2
                    shadow-sm
                    outline-none
                    transition-all
                    duration-200
                    hover:border-theme-strong
                    hover:bg-theme-elevated
                    sm:pr-3
                  "
                >
                  {/* Avatar */}
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-accent
                      text-xs
                      font-bold
                    "
                    style={{
                      color: "var(--accent-foreground)",
                    }}
                  >
                    {userInitial}
                  </span>

                  {/* Name */}
                  <span
                    className="
                      hidden
                      max-w-[90px]
                      truncate
                      text-xs
                      font-semibold
                      theme-text
                      md:block
                    "
                  >
                    {user?.name?.split(" ")[0] ||
                      "Account"}
                  </span>

                  <RiArrowDownSLine
                    size={15}
                    className={`
                      hidden
                      theme-muted
                      transition-transform
                      duration-200
                      md:block

                      ${
                        isProfileOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />
                </button>

                {/* =========================================
                    PROFILE DROPDOWN
                ========================================= */}

                {isProfileOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-[calc(100%+10px)]
                      z-[300]
                      w-[270px]
                      overflow-hidden
                      rounded-2xl
                      border
                      border-theme
                      bg-theme-card
                      shadow-2xl
                      theme-transition
                    "
                  >
                    {/* Account Header */}
                    <div
                      className="
                        border-b
                        border-theme
                        bg-theme-elevated
                        p-4
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-accent
                            text-sm
                            font-bold
                          "
                          style={{
                            color:
                              "var(--accent-foreground)",
                          }}
                        >
                          {userInitial}
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="
                              truncate
                              text-sm
                              font-bold
                              theme-text
                            "
                          >
                            {user?.name ||
                              "Deen 360 User"}
                          </h3>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-xs
                              theme-muted
                            "
                          >
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="space-y-1 p-2">
                      <Link
                        to="/profile"
                        className="
                          group
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          font-medium
                          theme-secondary
                          transition-colors
                          hover:bg-accent-soft
                          hover:theme-accent
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-theme-elevated
                            transition-colors
                            group-hover:bg-accent-soft
                          "
                        >
                          <RiUserLine
                            size={16}
                            className="theme-accent"
                          />
                        </span>

                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/bookmarks"
                        className="
                          group
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          font-medium
                          theme-secondary
                          transition-colors
                          hover:bg-accent-soft
                          hover:theme-accent
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-theme-elevated
                            transition-colors
                            group-hover:bg-accent-soft
                          "
                        >
                          <RiBookmarkLine
                            size={16}
                            className="theme-accent"
                          />
                        </span>

                        <span>Bookmarks</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div
                      className="
                        border-t
                        border-theme
                        p-2
                      "
                    >
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          font-medium
                          text-red-500
                          transition-colors
                          hover:bg-red-500/10
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-500/10
                          "
                        >
                          <RiLogoutBoxLine size={16} />
                        </span>

                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ---------------------------------------------
                 SIGN IN
              --------------------------------------------- */

              <Link
                to="/login"
                className="ml-1"
              >
                <button
                  type="button"
                  className="
                    theme-button-gold
                    h-10
                    rounded-full
                    px-4
                    text-xs
                    sm:px-5
                    sm:text-sm
                  "
                >
                  Sign In
                </button>
              </Link>
            )}

            {/* -----------------------------------------------
                MOBILE MENU
            ----------------------------------------------- */}

            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setIsMenuOpen(true)}
              className="
                theme-icon-button
                ml-0.5
                lg:hidden
              "
            >
              <RiMenuLine size={21} />
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <MenuSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* =====================================================
          SEARCH MODAL
      ===================================================== */}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allChapters={chapters}
      />

      {/* =====================================================
          LANGUAGE MODAL
      ===================================================== */}

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