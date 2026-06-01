import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RiDoubleQuotesL, RiFocus2Line, RiTeamLine, RiHeartPulseLine } from '@remixicon/react';
import SectionWrapper from '../ui/SectionWrapper';

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const sectionRef = useRef(null);
  const quranAppRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-title", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-title",
          start: "top 85%",
        }
      });

      gsap.from(".info-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
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
      icon: <RiFocus2Line className="text-[#2ca4ab]" size={32} />,
      title: "Our Mission",
      desc: "To make the word of Allah accessible to every heart through modern technology and intuitive design."
    },
    {
      icon: <RiHeartPulseLine className="text-[#2ca4ab]" size={32} />,
      title: "Sadaqah Jariyah",
      desc: "This platform is built as a continuous charity, providing free access to Quranic resources for generations to come."
    },
    {
      icon: <RiTeamLine className="text-[#2ca4ab]" size={32} />,
      title: "Community Driven",
      desc: "Developed with the global Ummah in mind, ensuring accuracy and quality in every verse and translation."
    }
  ];

  return (
    <SectionWrapper>
      <section ref={sectionRef} className="py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="about-title text-[10px] font-black uppercase tracking-[0.4em] text-[#2ca4ab] mb-4">
              Behind the Platform
            </h2>
            <h1 className="about-title text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
              Connecting Hearts to <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ca4ab] to-teal-600">
                The Divine Revelation
              </span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="info-card relative">
              <RiDoubleQuotesL size={80} className="absolute -top-10 -left-6 text-teal-50 opacity-50 -z-10" />
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium italic">
                "We believe that technology should be a bridge to spirituality. Our goal is to provide a clutter-free, soul-soothing experience for everyone seeking to reflect on the Quran."
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-1 w-12 bg-[#2ca4ab] rounded-full"></div>
                <span className="font-bold uppercase tracking-widest text-sm text-gray-400">The Vision</span>
              </div>
            </div>

            <div className="info-card space-y-6">
              <p className="text-gray-500 text-lg leading-relaxed">
                Quran App is a comprehensive digital solution designed for the modern Muslim. Our platform integrates high-fidelity audio recitations, multi-language translations, and advanced search tools into a seamless user interface.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed">
                Every feature—from the random verse generator to the personalized bookmarks—is crafted with Human-Computer Interaction (HCI) principles to ensure accessibility and ease of use for all ages.
              </p>
            </div>
          </div>

          <div className="info-grid grid md:grid-cols-3 gap-8">
            {values.map((item, index) => (
              <div key={index} className="info-card p-10 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 border border-transparent hover:border-teal-100 group">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-4">{item.title}</h4>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
};

export default AboutUs;