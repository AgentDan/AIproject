import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useLabKeyFromLocation() {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const key = params.get('labKey');
    return key && key.trim() ? key : null;
  }, [location.search]);
}
