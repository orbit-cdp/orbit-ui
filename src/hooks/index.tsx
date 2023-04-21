import { useCallback, useEffect, useState } from 'react';

export const useLocalStorageState = (
  key: string,
  defaultState: string
): [string, (newState: string) => void] => {
  const [state, setState] = useState<string>(defaultState);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setState(stored ? JSON.parse(stored) : defaultState);
  }, [defaultState, key]);

  const setLocalStorageState = useCallback(
    (newState: string) => {
      const changed = state !== newState;
      if (!changed) {
        return;
      }
      setState(newState);
      if (newState === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newState));
      }
    },
    [state, key]
  );

  return [state, setLocalStorageState];
};
