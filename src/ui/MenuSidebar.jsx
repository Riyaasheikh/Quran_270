import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  RiCloseLine,
  RiBookOpenLine,
  RiBookmarkLine,
  RiGlobalLine,
  RiPaletteLine,
  RiLogoutBoxLine,
  RiArrowRightSLine,
  RiHome5Line,
} from "@remixicon/react";

import { useTheme } from "../context/ThemeContext";
import ThemeModal from "../components/theme/ThemeModal";
import LanguageSelector from "../components/global/LanguageSelector";
import { LANGUAGES } from "../i18n/config";

const MenuSidebar = ({ isOpen, onClose, user, onLogout }) => {
  const { theme, themes } = useTheme();
  const { i18n, t } = useTranslation();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const location = useLocation();

  const activeTheme = themes?.find((item) => item.id === theme) || themes?.[0];
  const activeLang = LANGUAGES.find((l) => l.code === (i18n.language || 'en')) || LANGUAGES[0];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const isActiveRoute = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      icon: RiHome5Line,
      label: t("nav.home", "Home"),
      description: "Quran sanctuary & surah index",
      to: "/",
    },
    {
      icon: RiBookOpenLine,
      label: "About Us",
      description: "Behind the Deen 360 platform",
      to: "/about",
    },
    {
      icon: RiBookmarkLine,
      label: t("nav.bookmarks", "Bookmarks"),
      description: "Your saved reflections & verses",
      to: "/bookmarks",
    },
  ];

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[110] bg-black/40 backdrop-blur-xs transition-all duration-300 ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Container (Adapts position for RTL/LTR automatically) */}
      <aside
        aria-hidden={!isOpen}
        aria-label="Navigation menu"
        className={`fixed ltr:right-0 rtl:left-0 top-0 z-[120] flex h-dvh w-full max-w-[360px] flex-col overflow-hidden border-x border-theme bg-theme text-theme shadow-2xl theme-transition duration-300 ${
          isOpen 
            ? "ltr:translate-x-0 rtl:translate-x-0" 
            : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-theme px-5 py-4">
          <Link to="/" onClick={onClose} className="group flex items-center gap-1">
            <span className="text-xl font-extrabold tracking-[-0.04em] theme-gold">
              Deen
            </span>
            <span className="text-xl font-light tracking-[-0.04em] theme-text">
              360
            </span>
            <span className="ms-1 h-1.5 w-1.5 rounded-full bg-gold" />
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <RiLogoutBoxLine size={14} className="rtl:rotate-180" />
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/login" onClick={onClose}>
                <button
                  type="button"
                  className="theme-button-gold rounded-full px-3.5 py-1.5 text-[11px]"
                >
                  {t("nav.signIn", "Sign In")}
                </button>
              </Link>
            )}

            <button
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="theme-icon-button h-9 w-9"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
        </header>

        {/* User Badge / Card */}
        {user && (
          <div className="mx-4 mt-4 rounded-2xl border border-theme bg-theme-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-sm text-[var(--accent-foreground)]">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] theme-gold">
                  Authenticated Reader
                </p>
                <p className="truncate text-sm font-bold theme-text">
                  {user?.name || user?.email || "Seeker"}
                </p>
                {user?.email && (
                  <p className="truncate text-xs theme-muted">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] theme-subtle">
            Navigation
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-2xl p-3 transition-all duration-200 ${
                    active ? "bg-accent-soft" : "hover:bg-theme-card"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      active ? "bg-accent-soft" : "bg-theme-elevated"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={active ? "theme-accent" : "theme-muted group-hover:theme-accent"}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${active ? "theme-accent font-bold" : "theme-text"}`}>
                      {item.label}
                    </span>
                    <span className="block truncate text-[11px] theme-muted">
                      {item.description}
                    </span>
                  </span>

                  <RiArrowRightSLine
                    size={17}
                    className={`theme-muted transition-transform duration-200 rtl:rotate-180 ${
                      active ? "theme-accent translate-x-0.5 rtl:-translate-x-0.5" : "group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Preferences Section */}
          <div className="mt-7">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] theme-subtle">
              Preferences
            </p>

            {/* Language Selector Button */}
            <button
              type="button"
              onClick={() => setIsLangOpen(true)}
              className="group flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-colors hover:bg-theme-card cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-elevated">
                <RiGlobalLine size={19} className="theme-muted group-hover:theme-accent" />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold theme-text">
                  Language
                </span>
                <span className="block text-[11px] theme-muted truncate">
                  {activeLang.native} ({activeLang.name})
                </span>
              </span>

              <RiArrowRightSLine size={17} className="theme-muted rtl:rotate-180" />
            </button>

            {/* Appearance / Theme Button */}
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="group flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-colors hover:bg-theme-card cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-elevated">
                <RiPaletteLine size={19} className="theme-muted group-hover:theme-accent" />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold theme-text">
                  Appearance
                </span>
                <span className="flex items-center gap-1.5 text-[11px] theme-muted">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-theme"
                    style={{ backgroundColor: activeTheme?.dot || "var(--accent)" }}
                  />
                  <span>{activeTheme?.name || "Current theme"}</span>
                </span>
              </span>

              <RiArrowRightSLine size={17} className="theme-muted rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="shrink-0 border-t border-theme bg-theme-card p-4">
          <div className="rounded-2xl border border-theme bg-theme-elevated p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-soft">
              <RiBookOpenLine size={17} className="theme-gold" />
            </div>
            <div>
              <p className="text-xs font-bold theme-text">Deen 360</p>
              <p className="text-[10px] theme-muted">Read. Reflect. Remember.</p>
            </div>
          </div>
        </footer>
      </aside>

      {/* Modals */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <LanguageSelector
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </>
  );
};

export default MenuSidebar;