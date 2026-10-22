import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiMoonClearLine,
  RiFireLine,
  RiCheckLine,
  RiArrowRightLine,
  RiSunLine,
  RiTimeLine,
} from "@remixicon/react";
import {
  getFastingRecords,
  toggleTodayFast,
  calculateFastingStreak,
} from "../../utils/fastingUtils";

const RamadanHomeCard = ({ suhoor = "04:37", iftar = "18:21", dayNumber = 12, totalDays = 30 }) => {
  const [records, setRecords] = useState(getFastingRecords());
  const todayStr = new Date().toISOString().split("T")[0];
  const isFastedToday = records.some((r) => r.date === todayStr && r.status === "completed");
  const streak = calculateFastingStreak(records);

  const handleToggle = () => {
    const updated = toggleTodayFast(suhoor, iftar);
    setRecords(updated);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6">
      <div className="theme-card p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-theme shadow-md">
        {/* Soft Ambient Glow */}
        <div
          className="absolute -top-14 -right-14 w-52 h-52 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Header Info */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 theme-badge theme-badge-gold text-[10px] font-bold uppercase tracking-widest mb-2">
              <RiMoonClearLine size={13} />
              <span>Ramadan 1448</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold theme-text tracking-tight">
              Day {dayNumber} <span className="theme-muted font-normal text-lg">/ {totalDays}</span>
            </h3>
            <p className="text-xs theme-muted mt-1">
              Fasting window calculated for your coordinates
            </p>
          </div>

          {/* Suhoor & Iftar Metric Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-theme-soft border border-theme">
              <RiSunLine size={20} className="theme-gold shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                  Suhoor Ends
                </span>
                <span className="text-sm font-extrabold font-mono theme-text">{suhoor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-theme-soft border border-theme">
              <RiTimeLine size={20} className="theme-accent shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider theme-subtle">
                  Iftar (Maghrib)
                </span>
                <span className="text-sm font-extrabold font-mono theme-text">{iftar}</span>
              </div>
            </div>
          </div>

          {/* Streak & Primary Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-2.5 w-full md:w-auto">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 text-xs font-bold theme-gold">
              <RiFireLine size={16} />
              <span>{streak} Day Fasting Streak</span>
            </div>

            {/* Fasted Check Button */}
            <button
              onClick={handleToggle}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isFastedToday
                  ? "bg-accent text-[var(--accent-foreground)] shadow-sm"
                  : "theme-button-outline"
              }`}
            >
              <RiCheckLine size={16} />
              <span>{isFastedToday ? "Fasted Today ✓" : "Mark Fasted Today"}</span>
            </button>

            {/* Link to Full Hub */}
            <Link
              to="/fasting"
              className="text-[11px] font-bold theme-muted hover:theme-accent transition-colors flex items-center gap-1"
            >
              <span>View Ramadan & Fasting Hub</span>
              <RiArrowRightLine size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RamadanHomeCard;