import HomePage from "@/components/HomeScreen/HomePage";
import { useSubscription } from "@/hooks/useSubscription";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#35d07f";

export default function Home() {
  const {error, loading, plans} = useSubscription()
  console.log('subscription: ', plans)

  return (
    <HomePage />
  );
}