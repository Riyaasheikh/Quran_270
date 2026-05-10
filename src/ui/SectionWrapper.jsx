import React from 'react';

const SectionWrapper = ({ children, className = "" }) => {
  return (
    /* 
       1. Max-width matches your Surah/Juz/Revelation grids
       2. mx-auto centers the container
       3. px-4 md:px-6 provides responsive horizontal padding
       4. my-8 adds consistent vertical spacing between sections
    */
    <section className={`max-w-[1100px] mx-auto px-4 md:px-6 my-8 ${className}`}>
      <div className="rounded-md border-none border overflow-hidden">
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;