import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { askGuideAgent } from '../../api/guideApi';

const QUICK_PROMPTS = [
  'Where is the story of Prophet Yusuf?',
  'What is a Hadith about patience?',
  'Where do I check prayer times here?',
  'Open the Zakat calculator',
];

export default function GuideChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [autoNavigate, setAutoNavigate] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() =>
    localStorage.getItem('guide_session_id') || ''
  );
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Assalamu Alaikum! Ask me any Islamic question, search for a Prophet story or Hadith topic, or tell me where you want to go on this site.',
      navigation: null,
      citations: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!overrideText) setInput('');
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
        localStorage.setItem('guide_session_id', data.session_id);
      }

      const assistantMsg = {
        role: 'assistant',
        text: data.reply,
        navigation: data.navigation?.has_route ? data.navigation : null,
        citations: Array.isArray(data.citations) ? data.citations : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically navigate when the user asked to find/open a page and auto-nav is enabled
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
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, I could not connect to The Guide right now. Please ensure the backend server is running.',
          navigation: null,
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-3 flex h-[500px] w-[350px] sm:w-[390px] flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-emerald-950/90 to-slate-900 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-emerald-300">
                The Guide • Islamic Q&A & Navigator
              </h3>
              <p className="text-[11px] text-slate-400">
                Ask about Quran, Hadith, Prophets, or site pages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoNavigate((v) => !v)}
                title="Toggle automatic page navigation"
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                  autoNavigate
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {autoNavigate ? 'Auto-Nav ON' : 'Auto-Nav OFF'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close Guide Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}

                  {/* Citations */}
                  {msg.citations?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-800 pt-2">
                      {msg.citations.map((cite, cIdx) => (
                        <span
                          key={cIdx}
                          className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300 border border-amber-500/20"
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
                      className="mt-2.5 flex w-full items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/25"
                    >
                      <span>
                        Go to {msg.navigation.label || msg.navigation.path}
                      </span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-emerald-300 animate-pulse">
                  Searching knowledge & site guide...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Prompts (shown on initial screen) */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-800/80 bg-slate-900/50 px-3 py-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="border-t border-slate-800 bg-slate-950 p-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 focus-within:border-emerald-500/60">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Islam or where to go..."
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/50 transition hover:scale-105"
      >
        <span>🕌</span>
        <span>{isOpen ? 'Close Guide' : 'Ask The Guide'}</span>
      </button>
    </div>
  );
}