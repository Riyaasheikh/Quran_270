// import React, { useEffect, useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   RiSearchLine,
//   RiLoader4Line,
//   RiBookOpenLine,
//   RiUserStarLine,
//   RiGroupLine,
//   RiShieldCheckLine,
//   RiAlertLine,
//   RiArrowRightUpLine,
//   RiErrorWarningLine,
// } from '@remixicon/react';
// import Navbar from '../components/global/Navbar';
// import Footer from '../components/global/Footer';
// import api from '../lib/axios';

// const parseList = (str) =>
//   !str || str === '-' ? [] : str.split(';').map((s) => s.trim()).filter(Boolean);

// const parseAnchors = (str) =>
//   parseList(str).map((raw) => {
//     const m = raw.match(/(\d{1,3}):(\d{1,3})/);
//     return { label: raw, surahId: m?.[1] ?? null, verseNum: m?.[2] ?? null };
//   });

// function AnchorChips({ anchors, onJump }) {
//   return (
//     <div className="flex flex-wrap gap-1.5">
//       {anchors.map((a, i) => (
//         <button
//           key={i}
//           type="button"
//           disabled={!a.surahId}
//           onClick={() => onJump(a.surahId, a.verseNum)}
//           className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg
//                      bg-accent-soft text-accent border border-accent/20 transition-colors
//                      hover:bg-accent/20 cursor-pointer
//                      disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {a.label}
//           {a.surahId && <RiArrowRightUpLine size={12} />}
//         </button>
//       ))}
//     </div>
//   );
// }

// function NoteBox({ label, children }) {
//   return (
//     <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-start gap-2.5">
//       <RiAlertLine size={16} className="text-warning shrink-0 mt-0.5" />
//       <p className="text-[11px] text-secondary leading-relaxed">
//         <strong className="font-bold text-warning">{label}: </strong>
//         {children}
//       </p>
//     </div>
//   );
// }

// export default function PropheticEncyclopedia() {
//   const [activeTab, setActiveTab] = useState('prophets');
//   const [prophets, setProphets] = useState([]);
//   const [figures, setFigures] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     let isMounted = true;
//     (async () => {
//       try {
//         const [p, f] = await Promise.all([
//           api.get('/api/quran/prophets'),
//           api.get('/api/quran/figures'),
//         ]);
//         if (isMounted) {
//           setProphets(p.data.prophets || []);
//           setFigures(f.data.figures || []);
//         }
//       } catch (err) {
//         console.error('Error fetching prophetic encyclopedia:', err);
//         if (isMounted) setError('Failed to load directory data. Ensure Laravel is running and seeded.');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     })();
//     return () => { isMounted = false; };
//   }, []);

//   const filteredProphets = useMemo(() => {
//     const q = searchQuery.toLowerCase().trim();
//     if (!q) return prophets;
//     return prophets.filter(
//       (p) =>
//         p.prophet_name?.toLowerCase().includes(q) ||
//         p.name_ar?.includes(q) ||
//         p.quranic_status_note?.toLowerCase().includes(q) ||
//         p.proposed_segments?.toLowerCase().includes(q)
//     );
//   }, [prophets, searchQuery]);

//   const filteredFigures = useMemo(() => {
//     const q = searchQuery.toLowerCase().trim();
//     if (!q) return figures;
//     return figures.filter(
//       (f) =>
//         f.figure_or_group?.toLowerCase().includes(q) ||
//         f.figure_type?.toLowerCase().includes(q) ||
//         f.linked_prophets?.toLowerCase().includes(q)
//     );
//   }, [figures, searchQuery]);

//   const handleJumpToVerse = (surahId, verseNum) => {
//     if (surahId && verseNum) navigate(`/surah/${surahId}/${verseNum}`);
//   };

//   const tabClass = (tab) =>
//     `flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
//       activeTab === tab
//         ? 'bg-accent text-accent-foreground shadow-lg'
//         : 'text-muted hover:text-main'
//     }`;

//   if (loading) {
//     return (
//       <div className="theme-page h-screen w-full flex flex-col items-center justify-center gap-3">
//         <RiLoader4Line size={36} className="theme-accent animate-spin" />
//         <span className="text-xs font-bold uppercase tracking-[0.25em] theme-subtle">
//           Loading Prophetic Directory...
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
//       <div>
//         <Navbar />

//         <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">
//           <div className="text-center mb-10">
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3">
//               <RiShieldCheckLine size={16} /> Verified Relational Knowledge Graph
//             </div>
//             <h1 className="text-3xl md:text-4xl font-extrabold text-main mb-3">
//               Prophets &amp; Quranic Figures Directory
//             </h1>
//             <p className="text-sm text-muted max-w-2xl mx-auto">
//               Browse canonical passage anchors, narrative segments, and scholarly tafsir boundaries across the Quran.
//             </p>
//           </div>

//           <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
//             <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-2xl w-full md:w-auto">
//               <button type="button" onClick={() => setActiveTab('prophets')} className={tabClass('prophets')}>
//                 <RiUserStarLine size={16} /> Prophets ({prophets.length})
//               </button>
//               <button type="button" onClick={() => setActiveTab('figures')} className={tabClass('figures')}>
//                 <RiGroupLine size={16} /> Figures &amp; Groups ({figures.length})
//               </button>
//             </div>

//             <div className="relative w-full md:w-80">
//               <RiSearchLine size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder={
//                   activeTab === 'prophets'
//                     ? 'Filter prophets or events...'
//                     : 'Filter figures or linked prophets...'
//                 }
//                 className="theme-input pl-10"
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-xl text-center mb-8 flex items-center justify-center gap-2 text-sm">
//               <RiErrorWarningLine size={18} /> {error}
//             </div>
//           )}

//           {!error && activeTab === 'prophets' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {filteredProphets.map((prophet) => {
//                 const anchors = parseAnchors(prophet.principal_passage_anchors);
//                 const segments = parseList(prophet.proposed_segments);

//                 return (
//                   <div key={prophet.id} className="theme-card theme-card-static p-6 flex flex-col justify-between gap-5">
//                     <div>
//                       <div className="flex items-start justify-between gap-3 mb-3">
//                         <div>
//                           <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
//                             Prophet #{prophet.prophet_no}
//                           </span>
//                           <h2 className="text-xl font-extrabold text-main flex items-center gap-2.5 mt-0.5">
//                             <span>{prophet.prophet_name}</span>
//                             <span className="font-arabic text-2xl text-gold font-normal">{prophet.name_ar}</span>
//                           </h2>
//                         </div>
//                         <span className="theme-badge theme-badge-gold shrink-0">
//                           {prophet.status?.replace('_', ' ')}
//                         </span>
//                       </div>

//                       <p className="text-xs text-secondary leading-relaxed mb-4">
//                         {prophet.quranic_status_note}
//                       </p>

//                       {segments.length > 0 && (
//                         <div className="mb-4">
//                           <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
//                             Key Narrative Segments
//                           </h3>
//                           <ul className="space-y-1.5">
//                             {segments.slice(0, 4).map((seg, i) => (
//                               <li key={i} className="text-xs text-secondary bg-page-soft px-3 py-1.5 rounded-lg border border-border">
//                                 • {seg}
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       )}

//                       {anchors.length > 0 && (
//                         <div className="mb-4">
//                           <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
//                             <RiBookOpenLine size={13} className="text-accent" />
//                             Passage Anchors (Click to Read)
//                           </h3>
//                           <AnchorChips anchors={anchors.slice(0, 8)} onJump={handleJumpToVerse} />
//                         </div>
//                       )}
//                     </div>

//                     {prophet.flags_and_do_not_assume && (
//                       <NoteBox label="Scholarly Boundary">{prophet.flags_and_do_not_assume}</NoteBox>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {!error && activeTab === 'figures' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {filteredFigures.map((item) => {
//                 const anchors = parseAnchors(item.principal_anchors);

//                 return (
//                   <div key={item.id} className="theme-card theme-card-static p-6 flex flex-col justify-between gap-4">
//                     <div>
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="theme-badge theme-badge-accent">
//                           {item.figure_type?.replace('_', ' ')}
//                         </span>
//                         <span className="theme-badge">
//                           {item.identity_status?.replace('_', ' ')}
//                         </span>
//                       </div>
//                       <h2 className="text-lg font-bold text-main mb-3">{item.figure_or_group}</h2>

//                       {item.linked_prophets && item.linked_prophets !== '-' && (
//                         <p className="text-xs text-muted mb-3">
//                           <span className="font-semibold text-secondary">Linked Prophets: </span>
//                           {item.linked_prophets}
//                         </p>
//                       )}

//                       {anchors.length > 0 && (
//                         <div className="mb-3">
//                           <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
//                             Quranic Occurrences
//                           </h3>
//                           <AnchorChips anchors={anchors} onJump={handleJumpToVerse} />
//                         </div>
//                       )}
//                     </div>

//                     {item.do_not_assume_or_flags && (
//                       <NoteBox label="Verification Note">{item.do_not_assume_or_flags}</NoteBox>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </main>
//       </div>

//       <Footer />
//     </div>
//   );
// }