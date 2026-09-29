/**
 * Tab badge context.
 *
 * Lets any screen deep in the tree (e.g. the Food Court cart) publish a count
 * that the floating tab bar renders as a live badge, without the tab bar
 * needing to know anything about the cart.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type TabBadges = Record<string, number>;

const TabBadgeContext = createContext<{
  badges: TabBadges;
  setBadge: (routeName: string, count: number) => void;
}>({ badges: {}, setBadge: () => {} });

export function TabBadgeProvider({ children }: { children: React.ReactNode }) {
  const [badges, setBadges] = useState<TabBadges>({});

  const setBadge = useCallback((routeName: string, count: number) => {
    setBadges((prev) => {
      const current = prev[routeName] ?? 0;
      if (current === count) return prev;
      if (count <= 0) {
        const { [routeName]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [routeName]: count };
    });
  }, []);

  const value = useMemo(() => ({ badges, setBadge }), [badges, setBadge]);

  return <TabBadgeContext.Provider value={value}>{children}</TabBadgeContext.Provider>;
}

export function useTabBadge() {
  return useContext(TabBadgeContext);
}

export default TabBadgeProvider;
