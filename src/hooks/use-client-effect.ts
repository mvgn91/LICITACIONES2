import { useEffect, type EffectCallback, type DependencyList } from 'react';

// A simple hook that runs an effect only on the client-side.
// This is useful for avoiding server-side execution of browser-specific code.
export const useClientEffect = (effect: EffectCallback, deps?: DependencyList) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, deps);
};
