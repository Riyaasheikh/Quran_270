import React, { useState } from "react";

import SurahSection from "../components/surah/SurahSection";
import JuzSection from "../components/juz/Juz";
import RevelationSection from "../components/revelation/RevelationSection";

import SectionWrapper from "../ui/SectionWrapper";

const QuranTab = () => {

  const [activeTab, setActiveTab] =
    useState("Surah");

  const tabs = [
    "Surah",
    "Juz",
    "Revelation Order",
  ];


  const renderContent = () => {

    switch (activeTab) {

      case "Surah":
        return <SurahSection />;

      case "Juz":
        return <JuzSection />;

      case "Revelation Order":
        return <RevelationSection />;

      default:
        return <SurahSection />;

    }

  };


  return (
    <SectionWrapper>

      <section className="theme-page min-h-screen pt-8">

        <div className="max-w-[1400px] mx-auto px-4 md:px-6">

          {/* Tabs */}
          <nav
            className="
              flex
              items-center
              border-b
              overflow-x-auto
              no-scrollbar
            "
            style={{
              borderColor: "var(--border)",
            }}
            role="tablist"
          >

            {tabs.map((tab) => {

              const active =
                activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`
                    relative
                    shrink-0
                    px-6
                    md:px-8
                    py-5
                    text-sm
                    md:text-[15px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    transition-all
                    ${
                      active
                        ? "text-accent"
                        : "theme-muted hover:text-theme"
                    }
                  `}
                >

                  {tab}

                  {active && (
                    <span
                      className="
                        absolute
                        bottom-[-1px]
                        left-1/2
                        -translate-x-1/2
                        w-12
                        md:w-full
                        max-w-28
                        h-[3px]
                        rounded-t-full
                      "
                      style={{
                        background:
                          "var(--gradient-gold)",
                      }}
                    />
                  )}

                </button>
              );

            })}

          </nav>

        </div>


        {/* Content */}
        <div
          key={activeTab}
          className="
            animate-in
            fade-in
            slide-in-from-bottom-2
            duration-500
          "
        >
          {renderContent()}
        </div>

      </section>

    </SectionWrapper>
  );
};

export default QuranTab;