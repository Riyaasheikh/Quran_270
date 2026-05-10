import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchQuran } from '../api/quranApi'
import Navbar from '../components/global/Navbar';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchQuran(query).then(data => {
        setResults(data);
        setLoading(false);
      });
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
        
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-20 bg-gray-100 rounded-xl"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {results.length > 0 ? results.map((res, index) => (
              <div key={index} className="p-6 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex justify-between mb-3">
                  <span className="font-bold text-[#2ca4ab]">Verse {res.verse_key}</span>
                </div>
                <p className="text-right text-2xl font-serif mb-4 leading-loose">
                  {res.text}
                </p>
                {/* Search API usually returns snippets, you can dangerouslySetInnerHTML if it contains <em> tags */}
                <p className="text-gray-600 italic" dangerouslySetInnerHTML={{ __html: res.translations[0].text }} />
              </div>
            )) : (
              <p className="text-gray-500">No results found for your search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;