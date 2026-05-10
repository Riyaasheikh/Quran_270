import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchVersesByJuz } from '../../api/quranApi';
import Navbar from '../global/Navbar';

const JuzDetail = () => {
  const { juzId } = useParams();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJuz = async () => {
      setLoading(true);
      try {
        const data = await fetchVersesByJuz(juzId);
        setVerses(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadJuz();
  }, [juzId]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Juz {juzId}...</div>;

  return (
    <div className="min-h-screen bg-white text-[#1f2124] font-sans">
      <Navbar />
      
      {/* Header */}
      <div className="py-16 bg-[#F8F9FA] border-b border-gray-100 mb-10">
        <h1 className="text-5xl font-black text-center text-gray-900">Juz {juzId}</h1>
        <p className="text-center text-gray-400 mt-4 uppercase tracking-[0.3em] font-bold">Complete Juz Reading</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {verses.map((verse, index) => {
          // Logic to show Surah Name if the Surah changes within the Juz
          const showSurahHeader = index === 0 || verse.chapter_id !== verses[index - 1].chapter_id;
          
          return (
            <div key={verse.id}>
              {showSurahHeader && (
                <div className="mt-16 mb-8 py-4 border-y border-gray-100 text-center">
                  <span className="text-[#2ca4ab] font-black uppercase tracking-widest text-xs">Beginning of Surah {verse.chapter_id}</span>
                </div>
              )}
              
              <div className="group py-12 border-b border-gray-50 last:border-0">
                <div className="flex justify-between items-center mb-8 text-gray-400 text-sm font-bold">
                  <span>{verse.verse_key}</span>
                </div>

                <div className="text-right mb-10">
                  <p className="text-4xl md:text-5xl leading-[2.6] font-serif text-gray-900">
                    {verse.text_uthmani}
                    <span className="inline-flex items-center justify-center w-10 h-10 ml-6 border border-gray-200 rounded-full text-xs text-gray-400 font-bold">
                      {verse.verse_number}
                    </span>
                  </p>
                </div>

                <div className="text-left">
                  <p className="text-xl text-gray-800 leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: verse.translations?.[0]?.text }} />
                  </p>
                  <p className="text-[10px] text-[#2ca4ab] mt-4 font-black uppercase tracking-widest">— M.A.S. Abdel Haleem</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JuzDetail;