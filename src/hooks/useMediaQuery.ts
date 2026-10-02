'use client';

import { useEffect, useState } from 'react';

const useMediaQuery = (query: string): boolean | null => {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    update();
    mql.addEventListener('change', update);

    return () => {
      mql.removeEventListener('change', update);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
