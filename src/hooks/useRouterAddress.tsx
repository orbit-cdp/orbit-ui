import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { fetchRouter } from '../services/router';

export const useRouterAddress = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  const { activeChain } = sorobanContext;

  const { data, error, isLoading, mutate } = useSWRImmutable(
    ['router', activeChain],
    ([key, activeChain]) => fetchRouter(activeChain?.id!)
  );

  const [router, setRouter] = useState<string>();

  useEffect(() => {
    if (!data || !sorobanContext) return;

    setRouter(data.address);
  }, [data, sorobanContext]);

  return { router, isLoading, isError: error, data };
};
