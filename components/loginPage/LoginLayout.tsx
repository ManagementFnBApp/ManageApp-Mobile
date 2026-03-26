import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

import * as authApi from '@/apis/auth';
import Loading from '@/components/LoadingScreen/Loading';
import Login from '@/components/loginPage/Login';
import Register from '@/components/loginPage/Register';
import SuccessPopup from '@/components/Notifications/Success';
import { useAuth } from '@/providers/AuthProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ErrorPopup from '../Notifications/Error';


const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";
const { width } = Dimensions.get('window');

type Tab = 'login' | 'register';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;


  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showError = (msg: string) => setErrorMessage(msg);
  const clearError = () => setErrorMessage(null);

  const auth = useAuth();
  const router = useRouter();
  const { login } = auth!;

  const params = useLocalSearchParams<{ errorMessage?: string }>();

  useEffect(() => {
    if (params.errorMessage) {
      showError(decodeURIComponent(params.errorMessage));
    }
  }, [params.errorMessage]);

  useEffect(() => {
    if (auth?.token) {
      router.replace('/(tabs)/Home');
    }
  }, [auth?.token, router]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: tab === 'login' ? 0 : 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  const handleRegisterSuccess = (message: string) => {
    setSuccessMessage(message);
    switchTab('login');
  };

  const handleLogin = async (username: string, password: string) => {
    clearError();
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      //console.log('Login response:', res);

      const tokenValue = (res as any).token;
      if (typeof tokenValue !== 'string') {
        console.warn('Login response token is not a string, converting:', tokenValue);
      }
      await login(tokenValue as any);
    } catch (error: any) {
      const status: number | undefined = error.status ?? error.response?.status;
      const message: string = error.message || error.response?.message || 'An error occurred during login';

      if (status === 401) {
        showError(message);
      } else if (status === 500) {
        showError('Server error – please try again later');
      } else {
        showError(message);
      }

      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };


  const TAB_WIDTH = (width - 60) / 2;
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_WIDTH],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Image Section */}
      <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={styles.headerImage}
      >
        <ErrorPopup
          message={errorMessage}
          onDismiss={clearError}
          autoDismissMs={4000}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(255,255,255,1)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LumioViet</Text>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>
                  {activeTab === 'login' ? 'Welcome Back' : 'Get Started'}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  {activeTab === 'login'
                    ? 'Sign in to manage your restaurant\nand staff operation'
                    : 'Create an account to get started\nwith FnB Manager'}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>

      {/* Tab Switcher */}
      {/* <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <Animated.View
            style={[
              styles.tabIndicator,
              { width: TAB_WIDTH, transform: [{ translateX: indicatorTranslateX }] },
            ]}
          />
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => switchTab('login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => switchTab('register')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Form Area */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SuccessPopup
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
          autoDismissMs={5000}
        />

        {activeTab === 'login'
          ? <Login loading={loading} setLoading={setLoading} handleLogin={handleLogin} />
          : <Register
            loading={loading}
            setLoading={setLoading}
            onSuccess={handleRegisterSuccess}
          />
        }
      </ScrollView>

      <Loading visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#111',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 5,
  },
  welcomeContainer: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    color: '#111',
    fontSize: 42,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  tabContainer: {
    paddingHorizontal: 30,
    marginTop: 20,
    marginBottom: 8,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#eef0f2',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: GREEN,
    borderRadius: 9,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
});