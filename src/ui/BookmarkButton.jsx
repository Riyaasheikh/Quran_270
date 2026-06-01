import React, { useState } from "react";
import {
  RiBookmarkLine,
  RiBookmarkFill,
  RiLoader4Line,
} from "@remixicon/react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

const BookmarkButton = ({
  verse,
  translationId,
  initialIsBookmarked,
  onToggle,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleBookmark = async () => {
    setLoading(true);
    console.log("verse object:", verse);

    try {
      const check = await api.get("/api/user").catch((e) => e.response);
      console.log("Auth status:", check?.status, check?.data);

      if (initialIsBookmarked) {
        await api.delete(
          `/api/bookmarks/${encodeURIComponent(verse.verse_key)}`,
        );
        onToggle(false);
      } else {
        await api.post("/api/bookmarks", {
          surah_id: parseInt(verse.verse_key.split(":")[0]),
          verse_number: verse.verse_number,
          verse_key: verse.verse_key,
          translation_id: translationId,
        });
        onToggle(true);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login", {
          state: { from: window.location.pathname },
        });
        return;
      }
      console.error("Bookmark error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleBookmark();
      }}
      disabled={loading}
      className="flex items-center justify-center p-1 rounded-full hover:bg-gray-50 transition-all active:scale-90"
    >
      {loading ? (
        <RiLoader4Line size={24} className="text-[#2ca4ab] animate-spin" />
      ) : initialIsBookmarked ? (
        <RiBookmarkFill
          size={24}
          className="text-[#2ca4ab] transition-transform"
        />
      ) : (
        <RiBookmarkLine
          size={24}
          className="text-gray-400 hover:text-[#2ca4ab] transition-colors"
        />
      )}
    </button>
  );
};

export default BookmarkButton;
