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

import { useTranslation } from "react-i18next";

import {
  RiGlobalLine,
  RiMenuLine,
  RiSearchLine,
  RiLogoutBoxLine,
  RiUserLine,
  RiBookmarkLine,
  RiArrowDownSLine,
  RiCompass3Line,
  RiMore2Fill,
  RiUserStarLine,
  RiBookOpenLine,
  RiMoonClearLine,
  RiMapPinLine,
  RiCalculatorLine,
} from "@remixicon/react";

import { AuthContext } from "../../context/AuthContext";
import { fetchChapters } from "../../api/quranApi";
import { LANGUAGES } from "../../i18n/config";

import LanguageSelector from "../global/LanguageSelector";
import SearchModal from "../../ui/SearchModal";
import MenuSidebar from "../../ui/MenuSidebar";

const PRIMARY_NAV_ITEMS = [
  { key: "nav.quran", label: "Quran", path: "/quran" },
  { key: "nav.quranExplorer", label: "Quran Explorer", path: "/quran-explorer" },
  { key: "nav.hadith", label: "Hadith", path: "/hadith" },
  { key: "nav.prayerTimes", label: "Prayer Times", path: "/prayer-times" },
  { key: "nav.supplications", label: "Supplications", path: "/supplications" },
];

const MORE_NAV_ITEMS = [
  {
    key: "nav.fasting",
    label: "Fasting",
    path: "/fasting",
    icon: RiMoonClearLine,
  },
  {
    key: "mosques.finder",
    label: "Mosque Finder",
    path: "/mosques",
    icon: RiMapPinLine,
  },
  {
    key: "nav.zakat",
    label: "Zakat Calculator",
    path: "/zakat",
    icon: RiCalculatorLine,
  },
  // {
  //   key: "nav.prophets",
  //   label: "Prophets Directory",
  //   path: "/prophets",
  //   icon: RiUserStarLine,
  // },
  {
    key: "nav.bookmarks",
    label: "Bookmarks",
    path: "/bookmarks",
    icon: RiBookmarkLine,
  },
  {
    key: "nav.about",
    label: "About Us",
    path: "/about",
    icon: RiBookOpenLine,
  },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const [chapters, setChapters] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { i18n, t } = useTranslation();

  const auth = useContext(AuthContext) || {};
  const user = auth.user;
  const logout = auth.logout;

  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const moreRef = useRef(null);

  const activeLang =
    LANGUAGES.find((l) => l.code === (i18n.language || "en")) ||
    LANGUAGES[0];

  useEffect(() => {
    let isMounted = true;

    const loadChapters = async () => {
      try {
        const data = await fetchChapters();
        if (isMounted) {
          setChapters(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch Quran chapters:", error);
        if (isMounted) {
          setChapters([]);
        }
      }
    };

    loadChapters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close profile & "More" dropdowns when clicking outside
  useEffect(() => {
    if (!isProfileOpen && !isMoreOpen) return;

    const handlePointerDown = (event) => {
      if (
        isProfileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (
        isMoreOpen &&
        moreRef.current &&
        !moreRef.current.contains(event.target)
      ) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isProfileOpen, isMoreOpen]);

  // Escape key handling
  useEffect(() => {
    const hasOpenUI =
      isMenuOpen ||
      isSearchOpen ||
      isLangOpen ||
      isProfileOpen ||
      isMoreOpen;

    if (!hasOpenUI) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        setIsLangOpen(false);
        setIsProfileOpen(false);
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, isSearchOpen, isLangOpen, isProfileOpen, isMoreOpen]);

  // Lock background scroll for full overlays / drawer
  useEffect(() => {
    const shouldLockScroll = isMenuOpen || isSearchOpen || isLangOpen;
    if (!shouldLockScroll) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen, isSearchOpen, isLangOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMoreOpen(false);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsLangOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (isLoggingOut || typeof logout !== "function") return;

    try {
      setIsLoggingOut(true);
      await logout();
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActiveRoute = (path) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const isAnyMoreActive = MORE_NAV_ITEMS.some((item) =>
    isActiveRoute(item.path)
  );

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  const dropdownItemClass = `
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
    theme-secondary
    transition-colors
    duration-200
    hover:bg-accent-soft
    hover:theme-accent
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-accent
  `;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="
          sticky
          top-0
          z-40
          w-full
          border-b
          border-theme
          bg-theme
          theme-transition
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[68px]
            sm:h-[72px]
            w-full
            max-w-7xl
            items-center
            justify-between
            gap-3
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* BRAND */}
          <Link
            to="/"
            aria-label="Deen 360 Home"
            className="
              group
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-lg
              outline-none
              focus-visible:ring-2
              focus-visible:ring-accent
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
              <span className="theme-gold">Deen</span>
              <span className="theme-text font-light">360</span>
            </div>

            <span
              aria-hidden="true"
              className="mt-[-14px] h-1.5 w-1.5 rounded-full bg-gold opacity-80"
            />
          </Link>

          {/* DESKTOP NAVIGATION (xl and up so tablet/small laptop never cramp) */}
          <div className="hidden items-center gap-1 xl:flex">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const active = isActiveRoute(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group
                    relative
                    flex
                    h-10
                    shrink-0
                    items-center
                    whitespace-nowrap
                    rounded-xl
                    px-3.5
                    text-sm
                    font-medium
                    tracking-[-0.01em]
                    outline-none
                    transition-all
                    duration-200
                    focus-visible:ring-2
                    focus-visible:ring-accent
                    ${
                      active
                        ? "theme-accent bg-accent-soft"
                        : "theme-secondary hover:bg-theme-card hover:theme-text"
                    }
                  `}
                >
                  {t(item.key, item.label)}

                  <span
                    aria-hidden="true"
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

            {/* MORE DROPDOWN */}
            <div ref={moreRef} className="relative shrink-0">
              <button
                type="button"
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsMoreOpen((prev) => !prev);
                }}
                className={`
                  flex
                  h-10
                  items-center
                  gap-1.5
                  whitespace-nowrap
                  rounded-xl
                  px-3.5
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  duration-200
                  cursor-pointer
                  focus-visible:ring-2
                  focus-visible:ring-accent
                  ${
                    isAnyMoreActive || isMoreOpen
                      ? "theme-accent bg-accent-soft"
                      : "theme-secondary hover:bg-theme-card hover:theme-text"
                  }
                `}
              >
                <span>{t("nav.more", "More")}</span>
                <RiArrowDownSLine
                  size={16}
                  className={`transition-transform duration-200 ${
                    isMoreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMoreOpen && (
                <div
                  role="menu"
                  aria-label="More navigation links"
                  className="
                    absolute
                    end-0
                    top-[calc(100%+10px)]
                    z-[280]
                    w-[240px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-theme
                    bg-theme-card
                    p-2
                    shadow-2xl
                    theme-transition
                  "
                >
                  {MORE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        role="menuitem"
                        aria-current={active ? "page" : undefined}
                        onClick={() => setIsMoreOpen(false)}
                        className={`${dropdownItemClass} ${
                          active ? "bg-accent-soft theme-accent" : ""
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-elevated">
                          <Icon size={16} className="theme-accent" />
                        </span>
                        <span>{t(item.key, item.label)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {/* SEARCH */}
            <button
              type="button"
              aria-label={t("nav.searchQuran", "Search Quran")}
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
              onClick={() => {
                setIsProfileOpen(false);
                setIsMoreOpen(false);
                setIsLangOpen(false);
                setIsSearchOpen(true);
              }}
              className="theme-icon-button theme-transition"
            >
              <RiSearchLine size={19} />
            </button>

            {/* LANGUAGE */}
            <button
              type="button"
              aria-label={t("nav.changeLanguage", "Change language")}
              title={activeLang?.native || activeLang?.name || "Language"}
              aria-haspopup="dialog"
              aria-expanded={isLangOpen}
              onClick={() => {
                setIsProfileOpen(false);
                setIsMoreOpen(false);
                setIsSearchOpen(false);
                setIsLangOpen(true);
              }}
              className="theme-icon-button theme-transition"
            >
              <RiGlobalLine size={19} />
            </button>

            {/* AUTHENTICATED USER OR SIGN IN */}
            {user ? (
              <div ref={profileRef} className="relative ms-1">
                <button
                  type="button"
                  aria-label={t("nav.openProfileMenu", "Open profile menu")}
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsProfileOpen((current) => !current);
                  }}
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
                    pe-2.5
                    shadow-sm
                    outline-none
                    transition-all
                    duration-200
                    hover:border-theme-strong
                    hover:bg-theme-elevated
                    focus-visible:ring-2
                    focus-visible:ring-accent
                    sm:pe-3
                  "
                >
                  <span
                    aria-hidden="true"
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
                    style={{ color: "var(--accent-foreground)" }}
                  >
                    {userInitial}
                  </span>

                  <span className="hidden max-w-[90px] truncate text-xs font-semibold theme-text md:block">
                    {user?.name?.split(" ")[0] || t("nav.account", "Account")}
                  </span>

                  <RiArrowDownSLine
                    aria-hidden="true"
                    size={15}
                    className={`hidden theme-muted transition-transform duration-200 md:block ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className="
                      absolute
                      end-0
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
                    <div className="border-b border-theme bg-theme-elevated p-4">
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
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
                          style={{ color: "var(--accent-foreground)" }}
                        >
                          {userInitial}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold theme-text">
                            {user?.name || "Deen 360 User"}
                          </h3>
                          <p className="mt-0.5 truncate text-xs theme-muted">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 p-2">
                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                        className={dropdownItemClass}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-elevated">
                          <RiUserLine size={16} className="theme-accent" />
                        </span>
                        <span>{t("nav.myProfile", "My Profile")}</span>
                      </Link>

                      <Link
                        to="/explorer"
                        role="menuitem"
                        aria-current={
                          isActiveRoute("/explorer") ? "page" : undefined
                        }
                        onClick={() => setIsProfileOpen(false)}
                        className={dropdownItemClass}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-elevated">
                          <RiCompass3Line size={16} className="theme-accent" />
                        </span>
                        <span>
                          {t("nav.thematicExplorer", "Thematic Explorer")}
                        </span>
                      </Link>

                      <Link
                        to="/bookmarks"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                        className={dropdownItemClass}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-elevated">
                          <RiBookmarkLine size={16} className="theme-accent" />
                        </span>
                        <span>{t("nav.bookmarks", "Bookmarks")}</span>
                      </Link>
                    </div>

                    <div className="border-t border-theme p-2">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={isLoggingOut}
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
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                          <RiLogoutBoxLine size={16} />
                        </span>
                        <span>
                          {isLoggingOut
                            ? t("nav.loggingOut", "Logging out...")
                            : t("nav.logout", "Logout")}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="
                  theme-button-gold
                  ms-1
                  inline-flex
                  h-9
                  sm:h-10
                  shrink-0
                  whitespace-nowrap
                  items-center
                  justify-center
                  rounded-full
                  px-3.5
                  text-xs
                  sm:px-5
                  sm:text-sm
                "
              >
                {t("nav.signIn", "Sign In")}
              </Link>
            )}

            {/* MENU DRAWER BUTTON (shown below xl so mobile & tablet get the full drawer) */}
            <button
              type="button"
              aria-label={t("nav.openMenu", "Open navigation menu")}
              aria-expanded={isMenuOpen}
              onClick={() => {
                setIsProfileOpen(false);
                setIsMoreOpen(false);
                setIsMenuOpen(true);
              }}
              className="theme-icon-button ms-0.5 xl:hidden"
            >
              <RiMenuLine size={21} />
            </button>
          </div>
        </div>
      </nav>

      {/* DRAWER & MODALS */}
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

      <LanguageSelector
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </>
  );
};

export default Navbar;