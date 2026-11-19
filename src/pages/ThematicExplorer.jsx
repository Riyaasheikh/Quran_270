// import React, { useMemo, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import {
//   RiBookOpenLine,
//   RiArrowRightLine,
//   RiArrowLeftLine,
//   RiLoader4Line,
//   RiCompass3Line,
//   RiErrorWarningLine,
//   RiSearchLine,
//   RiCloseLine,
//   RiLeafLine,
//   RiBook2Line,
//   RiShieldCheckLine,
//   RiInformationLine,
//   RiRefreshLine,
// } from '@remixicon/react';

// import Navbar from '../components/global/Navbar';
// import Footer from '../components/global/Footer';
// import api from '../lib/axios';

// const fetchThematicTopics = async () => {
//   const response = await api.get('/api/quran/topics');
//   const receivedTopics = response.data?.topics;

//   if (!Array.isArray(receivedTopics)) return [];

//   return receivedTopics.filter(
//     (topic) =>
//       topic &&
//       typeof topic.topic_title === 'string' &&
//       Array.isArray(topic.verses)
//   );
// };

// export default function ThematicExplorer() {
//   const [search, setSearch] = useState('');
//   const navigate = useNavigate();

//   const {
//     data: topics = [],
//     isLoading,
//     isError,
//     refetch,
//   } = useQuery({
//     queryKey: ['quran-thematic-topics'],
//     queryFn: fetchThematicTopics,
//   });

//   const filteredTopics = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return topics;

//     return topics.filter((topic) => {
//       const titleMatches = topic.topic_title?.toLowerCase().includes(query);
//       const verseMatches = topic.verses?.some(
//         (verse) =>
//           verse.verse_key?.toLowerCase().includes(query) ||
//           verse.relation_note?.toLowerCase().includes(query) ||
//           verse.classification?.toLowerCase().includes(query)
//       );

//       return titleMatches || verseMatches;
//     });
//   }, [topics, search]);

//   const totalVerses = useMemo(() => {
//     return topics.reduce(
//       (total, topic) => total + (Number(topic.verse_count) || topic.verses.length || 0),
//       0
//     );
//   }, [topics]);

//   const openVerse = (verseKey) => {
//     if (!verseKey || !/^\d{1,3}:\d{1,3}$/.test(verseKey)) return;
//     const [surahNumber, verseNumber] = verseKey.split(':');
//     navigate(`/surah/${surahNumber}/${verseNumber}`);
//   };

//   return (
//     <div className="theme-page theme-transition min-h-screen flex flex-col">
//       <Navbar />

//       <main className="flex-1 w-full">
//         {/* HERO SECTION */}
//         <section className="relative overflow-hidden">
//           <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
//             <div className="bg-accent-soft absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full blur-3xl opacity-40" />
//             <div className="bg-gold-soft absolute top-20 right-0 w-64 h-64 rounded-full blur-3xl opacity-30" />
//           </div>

//           <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10">
//             {/* TOP BACK BUTTON BAR */}
//             <div className="mb-6">
//               <Link
//                 to="/"
//                 className="theme-button-outline !min-h-[2.35rem] !px-4 !rounded-full text-xs inline-flex items-center gap-2"
//               >
//                 <RiArrowLeftLine size={16} />
//                 <span>Back to Home</span>
//               </Link>
//             </div>

//             <div className="max-w-3xl mx-auto text-center">
//               <div className="inline-flex items-center gap-2 theme-badge theme-badge-accent mb-6">
//                 <RiCompass3Line size={15} />
//                 <span className="uppercase tracking-[0.16em] text-[10px] sm:text-xs">
//                   Thematic Discovery
//                 </span>
//               </div>

//               <div className="bg-gold-soft theme-gold border border-theme w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-sm">
//                 <RiBookOpenLine size={27} />
//               </div>

//               <h1 className="theme-text text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
//                 Explore the Quran
//                 <span className="theme-accent block mt-2">
//                   Through Its Themes
//                 </span>
//               </h1>

//               <p className="theme-muted text-sm sm:text-base leading-7 max-w-2xl mx-auto mt-5 text-pretty">
//                 Discover thematic connections, explore recurring subjects, and
//                 follow related Quranic passages across different Surahs.
//               </p>

//               {/* STATS PILLS */}
//               <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
//                 <div className="theme-card theme-card-static px-5 py-3 min-w-[130px]">
//                   <p className="theme-muted text-[10px] font-bold uppercase tracking-wider">
//                     Themes
//                   </p>
//                   <p className="theme-text text-2xl font-bold mt-1 tabular-nums">
//                     {isLoading ? '—' : topics.length}
//                   </p>
//                 </div>

//                 <div className="theme-card theme-card-static px-5 py-3 min-w-[130px]">
//                   <p className="theme-muted text-[10px] font-bold uppercase tracking-wider">
//                     Listed Verses
//                   </p>
//                   <p className="theme-text text-2xl font-bold mt-1 tabular-nums">
//                     {isLoading ? '—' : totalVerses}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* TOPIC CONTENT */}
//         <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
//           {/* SECTION HEADER + SEARCH */}
//           <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-7">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <RiLeafLine size={17} className="theme-gold" />
//                 <span className="theme-gold text-xs font-bold uppercase tracking-[0.15em]">
//                   Browse the collection
//                 </span>
//               </div>

//               <h2 className="theme-text text-2xl sm:text-3xl font-bold">
//                 Discover Themes
//               </h2>

//               <p className="theme-muted text-sm mt-1.5">
//                 Select any verse reference to open and read its Surah.
//               </p>
//             </div>

//             <div className="relative w-full md:max-w-sm">
//               <RiSearchLine
//                 size={19}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 theme-muted pointer-events-none"
//               />

//               <input
//                 type="search"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search themes, notes, or 2:255..."
//                 aria-label="Search Quranic themes"
//                 className="theme-input pl-11 pr-11"
//               />

//               {search && (
//                 <button
//                   type="button"
//                   onClick={() => setSearch('')}
//                   aria-label="Clear search"
//                   className="absolute right-2.5 top-1/2 -translate-y-1/2 theme-icon-button theme-icon-button-sm"
//                 >
//                   <RiCloseLine size={17} />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* REVIEW NOTICE */}
//           <div className="bg-gold-soft border border-theme flex items-start gap-3 rounded-xl p-4 mb-8">
//             <RiInformationLine
//               size={20}
//               className="theme-gold shrink-0 mt-0.5"
//             />

//             <div>
//               <p className="theme-text text-sm font-semibold">
//                 About thematic connections
//               </p>
//               <p className="theme-secondary text-xs sm:text-sm leading-6 mt-1">
//                 These connections are provided as thematic study candidates.
//                 Their source and review status should be checked before treating
//                 them as established scholarly interpretations.
//               </p>
//             </div>
//           </div>

//           {/* LOADING STATE */}
//           {isLoading && (
//             <div className="theme-card theme-card-static flex flex-col items-center justify-center py-20 px-5">
//               <RiLoader4Line
//                 size={35}
//                 className="animate-spin theme-accent mb-4"
//               />
//               <p className="theme-text text-sm font-semibold">
//                 Exploring Quranic themes
//               </p>
//               <p className="theme-muted text-xs mt-1.5">
//                 Loading your thematic collection...
//               </p>
//             </div>
//           )}

//           {/* ERROR STATE */}
//           {!isLoading && isError && (
//             <div className="theme-card theme-card-static p-8 sm:p-12 text-center">
//               <div
//                 className="bg-theme-soft w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
//                 style={{ color: 'var(--danger)' }}
//               >
//                 <RiErrorWarningLine size={25} />
//               </div>

//               <h3 className="theme-text font-bold text-lg">
//                 Unable to load themes
//               </h3>

//               <p className="theme-muted text-sm mt-2 max-w-md mx-auto">
//                 We could not load the thematic topics. Please check your
//                 connection and try again.
//               </p>

//               <button
//                 type="button"
//                 onClick={() => refetch()}
//                 className="theme-button mt-6"
//               >
//                 <RiRefreshLine size={16} />
//                 <span>Try again</span>
//               </button>
//             </div>
//           )}

//           {/* EMPTY DATABASE */}
//           {!isLoading && !isError && topics.length === 0 && (
//             <div className="theme-card theme-card-static p-8 sm:p-14 text-center">
//               <RiBook2Line size={38} className="theme-muted mx-auto mb-4" />
//               <h3 className="theme-text text-lg font-bold">
//                 No themes available yet
//               </h3>
//               <p className="theme-muted text-sm mt-2 max-w-md mx-auto">
//                 The thematic collection is currently empty. Check that your
//                 Quranic cross-reference records have been imported into the
//                 database.
//               </p>
//             </div>
//           )}

//           {/* SEARCH EMPTY */}
//           {!isLoading &&
//             !isError &&
//             topics.length > 0 &&
//             filteredTopics.length === 0 && (
//               <div className="theme-card theme-card-static p-10 text-center">
//                 <RiSearchLine size={30} className="theme-muted mx-auto mb-3" />
//                 <h3 className="theme-text font-bold">No matching themes</h3>
//                 <p className="theme-muted text-sm mt-1.5">
//                   No themes or verse references matched "{search}".
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => setSearch('')}
//                   className="theme-button-outline mt-5"
//                 >
//                   Clear search
//                 </button>
//               </div>
//             )}

//           {/* TOPIC GRID */}
//           {!isLoading && !isError && filteredTopics.length > 0 && (
//             <>
//               <div className="flex items-center justify-between gap-3 mb-5">
//                 <p className="theme-muted text-xs font-medium">
//                   Showing {filteredTopics.length} of {topics.length} themes
//                 </p>

//                 <span className="theme-badge">
//                   <RiBookOpenLine size={13} />
//                   <span>Quranic study</span>
//                 </span>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
//                 {filteredTopics.map((topic) => {
//                   const topicKey = topic.topic_slug || topic.topic_title;

//                   return (
//                     <article
//                       key={topicKey}
//                       className="theme-card theme-card-static overflow-hidden flex flex-col"
//                     >
//                       {/* TOP GRADIENT BAR */}
//                       <div
//                         className="h-1 w-full"
//                         style={{ background: 'var(--gradient-primary)' }}
//                       />

//                       <div className="p-5 sm:p-6 flex flex-col flex-1">
//                         {/* TOPIC HEADER */}
//                         <div className="flex items-start justify-between gap-3 mb-5">
//                           <div className="flex items-start gap-3 min-w-0">
//                             <div className="bg-accent-soft theme-accent w-10 h-10 rounded-xl shrink-0 flex items-center justify-center">
//                               <RiBookOpenLine size={20} />
//                             </div>

//                             <div className="min-w-0">
//                               <h3 className="theme-text font-bold text-base sm:text-lg leading-snug">
//                                 {topic.topic_title}
//                               </h3>
//                               <p className="theme-muted text-xs mt-1">
//                                 Explore connected Quranic passages
//                               </p>
//                             </div>
//                           </div>

//                           <span className="theme-badge theme-badge-gold shrink-0">
//                             {topic.verse_count ?? topic.verses.length} verses
//                           </span>
//                         </div>

//                         {/* VERSE LIST */}
//                         <div className="space-y-2.5 flex-1">
//                           {topic.verses.map((verse) => {
//                             const status = verse.review_status || '';
//                             const isVerified =
//                               status.toLowerCase().includes('verified') &&
//                               !status.toLowerCase().includes('unverified');

//                             return (
//                               <button
//                                 key={`${topicKey}-${verse.verse_key}`}
//                                 type="button"
//                                 onClick={() => openVerse(verse.verse_key)}
//                                 className="group w-full text-left bg-theme-soft border border-theme hover:border-accent rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
//                               >
//                                 <div className="flex items-center justify-between gap-3">
//                                   <div className="min-w-0 flex-1">
//                                     <div className="flex items-center flex-wrap gap-2">
//                                       <span className="theme-accent text-xs font-bold">
//                                         {verse.verse_key}
//                                       </span>

//                                       {verse.classification && (
//                                         <span className="theme-muted text-[10px] px-2 py-0.5 rounded-full border border-theme bg-theme-card">
//                                           {verse.classification}
//                                         </span>
//                                       )}
//                                     </div>

//                                     <p className="theme-secondary text-xs leading-5 mt-1.5 line-clamp-2">
//                                       {verse.relation_note ||
//                                         'Explore this Quranic passage.'}
//                                     </p>

//                                     {verse.review_status && (
//                                       <div className="flex items-center gap-1.5 mt-2">
//                                         {isVerified ? (
//                                           <RiShieldCheckLine
//                                             size={13}
//                                             style={{ color: 'var(--success)' }}
//                                           />
//                                         ) : (
//                                           <RiInformationLine
//                                             size={13}
//                                             style={{ color: 'var(--warning)' }}
//                                           />
//                                         )}

//                                         <span className="theme-muted text-[10px] capitalize">
//                                           {verse.review_status
//                                             .replaceAll('_', ' ')
//                                             .toLowerCase()}
//                                         </span>
//                                       </div>
//                                     )}
//                                   </div>

//                                   <span className="bg-accent-soft theme-accent w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
//                                     <RiArrowRightLine size={16} />
//                                   </span>
//                                 </div>
//                               </button>
//                             );
//                           })}
//                         </div>

//                         {/* CARD FOOTER */}
//                         <div className="border-theme flex items-center justify-between gap-3 mt-5 pt-4 border-t">
//                           <span className="theme-muted text-[11px]">
//                             {topic.verses.length} connected passages listed
//                           </span>

//                           <span className="theme-gold text-xs font-semibold">
//                             Explore theme
//                           </span>
//                         </div>
//                       </div>
//                     </article>
//                   );
//                 })}
//               </div>
//             </>
//           )}
//         </section>
//       </main>

//       <Footer />
//     </div>
//   );
// }