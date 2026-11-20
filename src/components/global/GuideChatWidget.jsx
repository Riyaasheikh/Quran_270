import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSparklingFill,
  RiCloseLine,
  RiSendPlane2Fill,
  RiCompass3Line,
  RiArrowRightUpLine,
  RiRefreshLine,
  RiPaletteLine,
} from "@remixicon/react";
import { askGuideAgent } from "../../api/guideApi";
import { useTheme } from "../../context/ThemeContext";

const QUICK_PROMPTS = [
  "Where is the story of Prophet Yusuf?",
  "What is a Hadith about patience?",
  "Where do I check prayer times here?",
  "Open the Zakat calculator",
];

const INITIAL_MESSAGE = {
  role: "assistant",
  text: "Assalamu Alaikum! Ask me any Islamic question, search for a Prophet story or Hadith topic, or tell me where you want to go on this site.",
  navigation: null,
  citations: [],
};

export default function GuideChatWidget() {
  const navigate = useNavigate();
  const { theme, themes = [], setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [autoNavigate, setAutoNavigate] = useState(true);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem("guide_session_id") || ""
  );
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setThemePickerOpen(false);
    }
  }, [isOpen]);

  const handleResetChat = () => {
    localStorage.removeItem("guide_session_id");
    setSessionId("");
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!overrideText) setInput("");
    setLoading(true);

    try {
      const historyPayload = updatedMessages
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const data = await askGuideAgent({
        message: text,
        sessionId,
        history: historyPayload,
      });

      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem("guide_session_id", data.session_id);
      }

      const assistantMsg = {
        role: "assistant",
        text: data.reply,
        navigation: data.navigation?.has_route ? data.navigation : null,
        citations: Array.isArray(data.citations) ? data.citations : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (
        autoNavigate &&
        data.navigation?.has_route &&
        data.navigation?.auto_navigate &&
        data.navigation?.path
      ) {
        setTimeout(() => {
          navigate(data.navigation.path);
        }, 700);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I could not connect to The Guide right now. Please ensure the backend server is running.",
          navigation: null,
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[90] flex flex-col items-end theme-transition">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-3 flex h-[min(540px,78vh)] w-[calc(100vw-2rem)] sm:w-[400px] flex-col overflow-hidden rounded-3xl border border-theme theme-card shadow-2xl backdrop-blur-xl transition-all duration-200">
          {/* Header */}
          <div className="relative border-b border-theme bg-theme-overlay px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent border border-accent/30 flex items-center justify-center shrink-0">
                  <RiSparklingFill size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold theme-text truncate">
                    The Guide
                  </h3>
                  <p className="text-[11px] theme-muted truncate">
                    Islamic Q&amp;A &amp; Sanctuary Navigator
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Auto-Nav Toggle */}
                <button
                  type="button"
                  onClick={() => setAutoNavigate((v) => !v)}
                  title="Toggle automatic page navigation"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition cursor-pointer border ${
                    autoNavigate
                      ? "bg-accent-soft text-accent border-accent/40"
                      : "bg-theme-soft theme-muted border-theme hover:theme-text"
                  }`}
                >
                  <RiCompass3Line size={12} />
                  <span>{autoNavigate ? "Auto-Nav" : "Manual"}</span>
                </button>

                {/* Theme Switcher Button (if themes array is exposed by ThemeContext) */}
                {Array.isArray(themes) && themes.length > 0 && typeof setTheme === "function" && (
                  <button
                    type="button"
                    onClick={() => setThemePickerOpen((prev) => !prev)}
                    title="Switch Theme"
                    aria-label="Switch Theme"
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      themePickerOpen
                        ? "bg-accent-soft text-accent"
                        : "theme-muted hover:theme-text hover:bg-theme-soft"
                    }`}
                  >
                    <RiPaletteLine size={16} />
                  </button>
                )}

                {/* Reset Conversation */}
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Reset Conversation"
                    aria-label="Reset Conversation"
                    className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-theme-soft transition cursor-pointer"
                  >
                    <RiRefreshLine size={15} />
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-theme-soft transition cursor-pointer"
                  aria-label="Close Guide Chat"
                >
                  <RiCloseLine size={18} />
                </button>
              </div>
            </div>

            {/* Inline Theme Selector Bar */}
            {themePickerOpen && themes.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-theme/60 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider theme-subtle shrink-0 mr-1">
                  Theme:
                </span>
                {themes.map((t) => {
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        setThemePickerOpen(false);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition cursor-pointer shrink-0 border ${
                        active
                          ? "bg-accent text-[var(--accent-foreground)] border-accent shadow-xs"
                          : "bg-theme-soft theme-muted border-theme hover:theme-text"
                      }`}
                    >
                      {t.name || t.id}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-sm bg-theme-page/40">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line shadow-2xs ${
                      isUser
                        ? "bg-accent text-[var(--accent-foreground)] rounded-br-sm font-medium"
                        : "bg-theme-card border border-theme theme-text rounded-bl-sm"
                    }`}
                  >
                    {msg.text}

                    {/* Citations */}
                    {msg.citations?.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-theme/60 pt-2">
                        {msg.citations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="theme-badge theme-badge-gold !text-[10px] !px-2 !py-0.5"
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Navigation Action Button */}
                    {msg.navigation?.has_route && msg.navigation?.path && (
                      <button
                        type="button"
                        onClick={() => navigate(msg.navigation.path)}
                        className="mt-2.5 flex w-full items-center justify-between gap-2 rounded-xl border border-accent/40 bg-accent-soft px-3 py-2 text-xs font-bold text-accent transition hover:opacity-90 cursor-pointer"
                      >
                        <span className="truncate">
                          Go to {msg.navigation.label || msg.navigation.path}
                        </span>
                        <RiArrowRightUpLine size={15} className="shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-theme bg-theme-card px-3.5 py-2.5 text-xs font-medium theme-accent shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <span>Searching knowledge &amp; site guide...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Prompts */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-theme bg-theme-soft/60 px-3.5 py-2.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-theme bg-theme-card px-2.5 py-1 text-[11px] font-medium theme-muted transition hover:border-accent/50 hover:theme-accent cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="border-t border-theme bg-theme-overlay p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-theme bg-theme-soft px-3 py-1.5 focus-within:border-accent transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Islam or where to go..."
                className="flex-1 bg-transparent text-xs sm:text-[13px] theme-text placeholder:theme-subtle focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-[var(--accent-foreground)] transition hover:opacity-90 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <RiSendPlane2Fill size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Guide" : "Ask The Guide"}
        className="group flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent px-4 py-3 text-xs sm:text-sm font-bold text-[var(--accent-foreground)] shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/15">
          {isOpen ? <RiCloseLine size={16} /> : <RiSparklingFill size={15} />}
        </span>
        <span>{isOpen ? "Close Guide" : "Ask The Guide"}</span>
      </button>
    </div>
  );
}