import { useQuery } from '@tanstack/react-query';
import { fetchSurahVerses, fetchChapters } from '../api/quranApi';

export const useChapters = () => {
  return useQuery({
    queryKey: ['chapters'],
    queryFn: fetchChapters,
    staleTime: Infinity,
    gcTime: Infinity, 
  });
};

export const useSurah = (chapterId) => {
  return useQuery({
    queryKey: ['surah', chapterId],
    queryFn: async () => {
      if (!chapterId) return [];
      return fetchSurahVerses(chapterId);
    },
    enabled: !!chapterId,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};