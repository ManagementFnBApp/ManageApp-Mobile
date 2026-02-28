import React from 'react';
import {
  Dimensions,
  StyleSheet
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerImage: {
    height: width * 0.7,
    width: '100%',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  logoContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 5,
  },
  welcomeContainer: {
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 30,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  forgotText: {
    color: GREEN,
    fontWeight: '600',
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerText: {
    color: '#888',
    fontSize: 14,
  },
  socialContainer: {
    alignItems: 'center',
  },
  loginWithText: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  socialIconWrapper: {
    alignItems: 'center',
  },
  socialBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialLabel: {
    color: '#888',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  footerText: {
    color: '#888',
  },
  loginButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactAdmin: {
    color: GREEN,
    fontWeight: '600',
  },
});