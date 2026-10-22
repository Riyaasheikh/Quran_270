import React from 'react';

const SectionWrapper = ({ children, className = "" }) => {
  return (
    <section className={`max-w-[1100px] mx-auto px-4 md:px-6 my-8 ${className}`}>
      <div className="rounded-md border-none border overflow-hidden">
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;