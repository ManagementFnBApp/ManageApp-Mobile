import HomePage from "@/components/HomeScreen/HomePage";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

export default function Home() {
  const auth = useAuth()
  const router = useRouter()

  if (auth?.loading) return null;

  useEffect(() => {
    console.log('user: ', auth)
    if (auth?.user?.role !== 'SHOPOWNER' && auth?.loading === false) {
      router.push('/loginPage')
    }
  }, [auth])

  return (
    <HomePage />
  );
}