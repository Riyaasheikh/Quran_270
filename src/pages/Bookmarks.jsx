import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiBookmarkFill, RiDeleteBinLine, RiLoader4Line, RiArrowLeftLine } from '@remixicon/react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/bookmarks' } });
      return;
    }

    api.get('/api/bookmarks/full') // we'll add this route
      .then(res => setBookmarks(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const removeBookmark = async (verseKey) => {
    await api.delete(`/api/bookmarks/${encodeURIComponent(verseKey)}`);
    setBookmarks(prev => prev.filter(b => b.verse_key !== verseKey));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RiLoader4Line size={32} className="text-[#2ca4ab] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800">
          <RiArrowLeftLine size={22} />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RiBookmarkFill className="text-[#2ca4ab]" size={24} />
          My Bookmarks
        </h1>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <RiBookmarkFill size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No bookmarks yet</p>
          <p className="text-sm mt-1">Bookmark verses while reading to see them here</p>
          <Link to="/" className="mt-6 inline-block px-6 py-2 bg-[#2ca4ab] text-white rounded-xl font-semibold hover:bg-[#258d93] transition-colors">
            Start Reading
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(bookmark => (
            <div key={bookmark.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <Link
                to={`/surah/${bookmark.surah_id}`}
                className="flex-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2ca4ab]/10 flex items-center justify-center text-[#2ca4ab] font-bold text-sm">
                    {bookmark.surah_id}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Verse {bookmark.verse_key}</p>
                    <p className="text-xs text-gray-400">Surah {bookmark.surah_id} • Verse {bookmark.verse_number}</p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => removeBookmark(bookmark.verse_key)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <RiDeleteBinLine size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;