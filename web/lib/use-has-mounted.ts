"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True only once the client has hydrated — portals need a real DOM node,
 *  which doesn't exist during SSR/the hydration render itself. This is the
 *  React-recommended replacement for the old `useEffect(() =>
 *  setMounted(true), [])` idiom (which trips the "no setState synchronously
 *  in an effect" lint rule despite being the correct pattern here). */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
