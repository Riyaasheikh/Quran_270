import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RiDoubleQuotesL, RiFocus2Line, RiTeamLine, RiHeartPulseLine } from '@remixicon/react';
import SectionWrapper from '../ui/SectionWrapper';

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-title", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-title-container",
          start: "top 85%",
        }
      });

      gsap.from(".info-card", {
        y: 45,
        opacity: 0,
        duration: 0.8,
        stagger: 0.18,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".info-grid",
          start: "top 80%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const values = [
    {
      icon: <RiFocus2Line size={30} className="theme-accent" />,
      title: t("about.missionTitle"),
      desc: t("about.missionDesc")
    },
    {
      icon: <RiHeartPulseLine size={30} className="theme-gold" />,
      title: t("about.sadaqahTitle"),
      desc: t("about.sadaqahDesc")
    },
    {
      icon: <RiTeamLine size={30} className="theme-accent" />,
      title: t("about.communityTitle"),
      desc: t("about.communityDesc")
    }
  ];

  return (
    <SectionWrapper>
      <section ref={sectionRef} className="theme-page py-24 px-6 overflow-hidden theme-transition">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="about-title-container text-center mb-20">
            <span className="about-title inline-block theme-badge theme-badge-accent uppercase tracking-[0.25em] text-[11px] mb-4">
              {t("about.badge")}
            </span>
            <h1 className="about-title text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight theme-text">
              {t("about.title")} <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                {t("about.titleGradient")}
              </span>
            </h1>
          </div>

          {/* Philosophy / Overview */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div className="info-card relative theme-card p-8 md:p-10 theme-card-static">
              <RiDoubleQuotesL 
                size={84} 
                className="absolute -top-6 ltr:-left-3 rtl:-right-3 text-accent/10 pointer-events-none -z-0 select-none rtl:scale-x-[-1]" 
              />
              <p className="relative z-10 text-lg md:text-xl theme-secondary leading-relaxed font-medium italic">
                "{t("about.quote")}"
              </p>
              <div className="relative z-10 mt-8 flex items-center gap-4">
                <div className="h-1 w-12 rounded-full bg-accent" />
                <span className="font-bold uppercase tracking-widest text-xs theme-subtle">
                  {t("about.corePhilosophy")}
                </span>
              </div>
            </div>

            <div className="info-card space-y-6">
              <p className="theme-secondary text-base md:text-lg leading-relaxed">
                {t("about.desc1")}
              </p>
              <p className="theme-muted text-base md:text-lg leading-relaxed">
                {t("about.desc2")}
              </p>
            </div>
          </div>

          {/* Value Props Grid */}
          <div className="info-grid grid md:grid-cols-3 gap-6 lg:gap-8">
            {values.map((item, index) => (
              <div
                key={index}
                className="info-card theme-card theme-card-lift p-8 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-theme-soft border border-theme flex items-center justify-center mb-6 group-hover:border-accent/40 transition-colors duration-300">
                    <div className="transform group-hover:scale-110 transition-transform duration-300 ease-out">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold theme-text mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="theme-muted leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-theme/60 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                  <span className="text-[11px] font-bold uppercase tracking-wider theme-subtle">
                    {t("about.standardOfCare")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
};

export default AboutUs;