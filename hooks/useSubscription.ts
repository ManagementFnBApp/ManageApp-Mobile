import { getSubscriptions, SubscriptionPlan } from '@/apis/SubscriptionAPI';
import { useEffect, useState } from 'react';

export type { SubscriptionPlan };

export const BILLING_CYCLE_LABEL: Record<string, string> = {
  MONTHLY: '/tháng',
  YEARLY: '/năm',
  ONCE: '',
};

export function formatServicePrice(price: number): string {
  if (price === 0) return '0đ';
  return price.toLocaleString('vi-VN') + 'đ';
}

export function getFeatureList(features: SubscriptionPlan['features']): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features.map(String);
  if (typeof features === 'object') return Object.values(features).map(String);
  return [];
}

interface UseSubscriptionResult {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubscription(): UseSubscriptionResult {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptions();
      setPlans(data);
    } catch {
      setError('Không thể tải danh sách gói dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, loading, error, refetch: fetchPlans };
}