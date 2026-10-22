import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppText } from "../../hooks/useAppText";
import {
  RiGlobalLine,
  RiArrowDownSLine,
  RiFireLine,
  RiPaletteLine,
} from "@remixicon/react";

import SectionWrapper from "../../ui/SectionWrapper";
import { useTheme } from "../../context/ThemeContext";
import ThemeModal from "../../components/theme/ThemeModal";
import LanguageSelector from "../global/LanguageSelector";
import { LANGUAGES } from "../../i18n/config";

const Footer = () => {
  const { tText } = useAppText();
  const { theme, themes } = useTheme();
  const { i18n, t } = useTranslation();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const activeTheme = themes?.find((item) => item.id === theme) || themes?.[0];
  const activeLang = LANGUAGES.find((l) => l.code === (i18n.language || 'en')) || LANGUAGES[0];

  const popularLinks = [
    { name: "Surah Yaseen", path: "/surah/36", desc: "Heart of Quran" },
    { name: "Surah Al-Mulk", path: "/surah/67", desc: "The Sovereignty" },
    { name: "Surah Al-Kahf", path: "/surah/18", desc: "The Cave" },
    { name: "Surah Ar-Rahman", path: "/surah/55", desc: "The Most Merciful" },
    { name: "Surah Al-Waqi'ah", path: "/surah/56", desc: "The Inevitable" },
    { name: "Surah Al-Muzzammil", path: "/surah/73", desc: "The Enwrapped One" },
  ];

  const navLinks = [
    { name: t("nav.home", "Home"), path: "/" },
    { name: "About Us", path: "/about" },
    { name: t("nav.bookmarks", "Bookmarks"), path: "/bookmarks" },
  ];

  return (
    <SectionWrapper>
      <footer className="w-full pt-14 md:pt-20 pb-8 theme-text transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16 px-4">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block transition-transform hover:scale-[1.02]">
              <span className="text-2xl font-black tracking-[-0.04em] uppercase">
                <span className="theme-gold">Deen</span>
                <span className="theme-text ms-1 font-light">360</span>
              </span>
            </Link>

            <div className="space-y-4 max-w-md">
              {/* Paragraphs and headings auto-translate into Urdu */}
      <h3>{tText("Read, Listen, Search, and Reflect")}</h3>
      <p>{tText("A calm, accessible platform to read, search, and listen to the Holy Quran. Equipped with scholarly translations, tafsir, and word-by-word tools for deep reflection.")}</p>
      <p>{tText("Architected as a continuous charity (Sadaqah Jariyah), dedicated to connecting hearts with the Divine Revelation.")}</p>

      <span>{tText("Navigate")}</span>
      <span>{tText("Popular Surahs")}</span>
      <p>{tText("All Rights Reserved.")}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest theme-gold">
              Navigate
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm font-medium theme-muted hover:theme-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Links */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 theme-gold">
              <RiFireLine size={18} />
              <h4 className="text-xs font-black uppercase tracking-widest">
                Popular Surahs
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {popularLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex flex-col px-3.5 py-3 rounded-xl border border-theme bg-theme-card hover:border-theme-strong hover:bg-accent-soft transition-all group"
                >
                  <span className="text-sm font-bold theme-text group-hover:theme-accent transition-colors">
                    {link.name}
                  </span>
                  <span className="text-xs theme-muted mt-0.5">
                    {link.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom Controls */}
        <div className="max-w-[1400px] mx-auto pt-8 border-t border-theme flex flex-col md:flex-row justify-between items-center gap-6 px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Theme Selector Button */}
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 border border-theme bg-theme-card rounded-xl text-sm font-semibold theme-text hover:border-theme-strong transition-all cursor-pointer"
              aria-label="Change color theme"
            >
              <RiPaletteLine size={17} className="theme-gold" />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeTheme?.dot || "var(--accent)" }}
              />
              <span>{activeTheme?.name || "Theme"}</span>
            </button>

            {/* Language Selector Trigger */}
            <button
              type="button"
              onClick={() => setIsLangOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 border border-theme bg-theme-card rounded-xl text-sm font-semibold theme-text hover:border-theme-strong transition-all cursor-pointer"
              aria-label="Change language"
            >
              <RiGlobalLine size={17} className="theme-gold" />
              <span>{activeLang.native}</span>
              <RiArrowDownSLine size={16} className="theme-muted" />
            </button>
          </div>

          <p className="text-xs font-medium theme-muted text-center md:text-end">
            © 2026 <span className="theme-text font-bold">Deen 360</span>. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <LanguageSelector
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </SectionWrapper>
  );
};

export default Footer;