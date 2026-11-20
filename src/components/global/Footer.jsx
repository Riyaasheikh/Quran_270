import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

/* Static data lives outside the component so it isn't rebuilt on every render.
   `id` maps to the `popularSurahs.<id>` translation key. Surah names are kept
   as transliterated proper nouns; only the descriptions are translated. */
const POPULAR_LINKS = [
  { id: "yaseen", name: "Surah Yaseen", path: "/surah/36" },
  { id: "mulk", name: "Surah Al-Mulk", path: "/surah/67" },
  { id: "kahf", name: "Surah Al-Kahf", path: "/surah/18" },
  { id: "rahman", name: "Surah Ar-Rahman", path: "/surah/55" },
  { id: "waqiah", name: "Surah Al-Waqi'ah", path: "/surah/56" },
  { id: "muzzammil", name: "Surah Al-Muzzammil", path: "/surah/73" },
];

const NAV_LINKS = [
  { labelKey: "nav.home", path: "/" },
  { labelKey: "nav.about", path: "/about" },
  { labelKey: "nav.bookmarks", path: "/bookmarks" },
];

const Footer = () => {
  const { theme, themes } = useTheme();
  const { t, i18n } = useTranslation();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const activeTheme =
    themes?.find((item) => item.id === theme) || themes?.[0];

  // Normalise "en-US" / "ur-PK" etc. to the base code used in LANGUAGES
  const currentCode = (i18n.resolvedLanguage || i18n.language || "en")
    .split("-")[0]
    .toLowerCase();

  const activeLang =
    LANGUAGES.find((l) => l.code === currentCode) || LANGUAGES[0];

  return (
    <SectionWrapper>
      <footer className="w-full pt-14 md:pt-20 pb-8 theme-text transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16 px-4">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link
              to="/"
              className="inline-block transition-transform hover:scale-[1.02]"
              aria-label="Deen 360"
            >
              {/* Brand name stays in Latin script in every language */}
              <span
                dir="ltr"
                className="text-2xl font-black tracking-[-0.04em] uppercase"
              >
                <span className="theme-gold">Deen</span>
                <span className="theme-text ms-1 font-light">360</span>
              </span>
            </Link>

            <div className="space-y-4 max-w-md">
              <h3>{t("footer.headline")}</h3>
              <p>{t("footer.desc")}</p>
              <p>{t("footer.sadaqahNote")}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-6">
            {/* rtl:tracking-normal — letter-spacing breaks joined Arabic-script letters */}
            <h4 className="text-xs font-black uppercase tracking-widest rtl:tracking-normal theme-gold">
              {t("footer.navigate")}
            </h4>
            <nav aria-label={t("footer.navigate")}>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm font-medium theme-muted hover:theme-accent transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Popular Links */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 theme-gold">
              <RiFireLine size={18} aria-hidden="true" />
              <h4 className="text-xs font-black uppercase tracking-widest rtl:tracking-normal">
                {t("footer.popularSurahs")}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {POPULAR_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex flex-col px-3.5 py-3 rounded-xl border border-theme bg-theme-card hover:border-theme-strong hover:bg-accent-soft transition-all group"
                >
                  <span className="text-sm font-bold theme-text group-hover:theme-accent transition-colors">
                    {link.name}
                  </span>
                  <span className="text-xs theme-muted mt-0.5">
                    {t(`popularSurahs.${link.id}`)}
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
              aria-label={t("nav.appearance")}
            >
              <RiPaletteLine size={17} className="theme-gold" aria-hidden="true" />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: activeTheme?.dot || "var(--accent)",
                }}
              />
              <span>{activeTheme?.name || t("nav.appearance")}</span>
            </button>

            {/* Language Selector Trigger */}
            <button
              type="button"
              onClick={() => setIsLangOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 border border-theme bg-theme-card rounded-xl text-sm font-semibold theme-text hover:border-theme-strong transition-all cursor-pointer"
              aria-label={t("nav.language")}
            >
              <RiGlobalLine size={17} className="theme-gold" aria-hidden="true" />
              <span>{activeLang.native}</span>
              <RiArrowDownSLine size={16} className="theme-muted" aria-hidden="true" />
            </button>
          </div>

          <p className="text-xs font-medium theme-muted text-center md:text-end">
            © {new Date().getFullYear()}{" "}
            <span className="theme-text font-bold">Deen 360</span>.{" "}
            {t("footer.allRightsReserved")}
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