import {
    BILLING_CYCLE_LABEL,
    SubscriptionPlan,
    formatServicePrice,
    getFeatureList,
    useSubscription,
} from '@/hooks/useSubscription';
import React, { createContext, useContext } from 'react';

interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const subscription = useSubscription();
  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextType {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptionContext must be used inside SubscriptionProvider');
  return ctx;
}

export { BILLING_CYCLE_LABEL, formatServicePrice, getFeatureList };
export type { SubscriptionPlan };
