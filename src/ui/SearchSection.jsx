import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { fetchChapters } from "../api/quranApi";
import SearchBar from "../components/search/SearchBar";
import QuickActions from "../components/search/QuickActions";

const SearchSection = () => {
  const [allChapters, setAllChapters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    fetchChapters()
      .then((chapters) => {
        if (mounted) {
          setAllChapters(Array.isArray(chapters) ? chapters : []);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch chapters:", error);

        if (mounted) {
          setAllChapters([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleGlobalSearch = (query) => {
    const normalizedQuery = query?.toLowerCase().trim();

    if (!normalizedQuery) {
      return;
    }

    if (normalizedQuery.includes("juz")) {
      const number = normalizedQuery.replace(/\D/g, "");

      if (number) {
        navigate(`/juz/${number}`);
        return;
      }
    }

    const found = allChapters.find((chapter) => {
      const name = chapter?.name_simple?.toLowerCase() || "";
      const id = String(chapter?.id || "");

      return (
        name.includes(normalizedQuery) ||
        id === normalizedQuery
      );
    });

    if (found) {
      navigate(`/surah/${found.id}`);
      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(query.trim())}`
    );
  };

  return (
    <section
      className="
        relative
        w-full
        min-h-[390px]
        overflow-hidden
        flex
        flex-col
        items-center
        justify-center
        px-4
        py-16
        bg-theme
      "
    >

      {/* Ambient theme lighting */}
      <div className="absolute inset-0 pointer-events-none">

        <div
          className="
            absolute
            inset-0
            opacity-80
          "
          style={{
            background:
              "linear-gradient(to bottom, var(--accent-soft), transparent 70%)",
          }}
        />

        <div
          className="
            absolute
            -top-32
            -right-32
            w-96
            h-96
            rounded-full
            blur-3xl
            opacity-40
          "
          style={{
            backgroundColor: "var(--accent)",
          }}
        />

        <div
          className="
            absolute
            -bottom-32
            -left-32
            w-96
            h-96
            rounded-full
            blur-3xl
            opacity-25
          "
          style={{
            backgroundColor: "var(--gold)",
          }}
        />
      </div>


      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

        {/* Brand */}
        <Link
          to="/"
          className="
            mb-10
            group
            transition-transform
            duration-500
            hover:scale-[1.02]
          "
        >
          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              tracking-[-0.06em]
              leading-none
              text-center
            "
          >
            <span className="text-theme">
              Deen
            </span>

            <span className="text-gold ml-2">
              360
            </span>
          </h1>
        </Link>


        {/* Search */}
        <div className="w-full">
          <SearchBar
            allChapters={allChapters}
            onSearch={handleGlobalSearch}
          />
        </div>


        {/* Quick actions */}
        <div className="mt-5">
          <QuickActions
            allChapters={allChapters}
          />
        </div>


        {/* Decorative divider */}
        <div className="flex items-center justify-center w-full my-5 opacity-80">

          <div
            className="w-32 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--gold))",
            }}
          />

          <span
            className="mx-3 text-lg"
            style={{ color: "var(--gold)" }}
          >
            ✦
          </span>

          <div
            className="w-32 h-px"
            style={{
              background:
                "linear-gradient(to left, transparent, var(--gold))",
            }}
          />

        </div>

      </div>
    </section>
  );
};

export default SearchSection;