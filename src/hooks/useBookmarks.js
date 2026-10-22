import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const useBookmarks = (storageKey = 'deen360_saved_hadiths') => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Get saved items scoped to user ID if logged in
  const getUserStorageKey = () => {
    return user ? `${storageKey}_user_${user.id || user.email}` : storageKey;
  };

  const getSavedItems = () => {
    try {
      const key = getUserStorageKey();
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  const toggleBookmark = (item, onAuthRequired) => {
    // 1. Guard check: if user is not logged in
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        // Redirect to login or prompt
        navigate('/login', { state: { from: window.location.pathname } });
      }
      return false;
    }

    // 2. User is authenticated -> save to user's collection
    const key = getUserStorageKey();
    const current = getSavedItems();
    const exists = current.some((saved) => saved.id === item.id);

    let updated;
    if (exists) {
      updated = current.filter((saved) => saved.id !== item.id);
    } else {
      updated = [
        {
          ...item,
          user_id: user.id || user.email,
          saved_at: new Date().toISOString(),
        },
        ...current,
      ];
    }

    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  };

  return {
    user,
    getSavedItems,
    toggleBookmark,
  };
};