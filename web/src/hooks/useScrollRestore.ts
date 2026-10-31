import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestore(): void {
  const location = useLocation();
  const key = `scroll:${location.pathname}`;

  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      window.scrollTo(0, parseInt(saved, 10));
    }
    return () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
  }, [key]);
}