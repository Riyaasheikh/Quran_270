import React from "react";
import { Link } from "react-router-dom";
import { RiBookOpenLine, RiArrowRightLine, RiSparklingFill } from "@remixicon/react";
import { HADITH_DATABASE } from "../../data/hadithData";
import SectionWrapper from "../../ui/SectionWrapper";

const HadithOfTheDay = () => {
  // Pull a canonical Hadith of the Day
  const hadith = HADITH_DATABASE[0];

  return (
    <SectionWrapper>
      <div className="theme-card p-12 flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold text-[10px] font-bold uppercase tracking-widest">
                <RiSparklingFill size={13} />
                <span>Hadith of the Moment</span>
              </div>

              <p className="font-quran text-xl sm:text-2xl text-right leading-loose theme-text" dir="rtl">
                {hadith.arabic}
              </p>

              <p className="text-sm theme-secondary leading-relaxed font-serif">
                "{hadith.english}"
              </p>

              <div className="flex items-center gap-2 text-xs theme-muted font-medium">
                <span className="theme-gold font-bold">{hadith.collectionName}</span>
                <span>•</span>
                <span>{hadith.reference}</span>
                <span>•</span>
                <span className="theme-accent font-semibold">{hadith.grade}</span>
              </div>
            </div>

            <div className="shrink-0 self-end md:self-center">
              <Link
                to="/hadith"
                className="theme-button flex items-center gap-2 !py-2.5 !px-5 text-xs font-bold"
              >
                <RiBookOpenLine size={16} />
                <span>Explore Hadith Library</span>
              </Link>
            </div>
          </div>

      </div>
    </SectionWrapper>
  );
};

export default HadithOfTheDay;