import React from 'react';
import {
  Dimensions
} from 'react-native';


import LoginLayout from '@/components/loginPage/LoginLayout';


const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#35d07f";

const { width } = Dimensions.get('window');

export default function LoginPage() {
  // const [loading, setLoading] = useState(false);
  // const auth = useAuth();
  // const router = useRouter();

  // // if already logged in, send to tabs
  // useEffect(() => {
  //   if (auth?.token) {
  //     router.replace('/(tabs)/Home');
  //   }
  // }, [auth?.token, router]);

  return (
    <LoginLayout />
  );
}