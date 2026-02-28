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
  TouchableOpacity,
  View
} from 'react-native';

import Loading from '@/components/LoadingScreen/Loading';
import Login from '@/components/loginPage/Login';
import Register from '@/components/loginPage/Register';
import SuccessPopup from '@/components/Notifications/Success';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';


const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#35d07f";
const { width } = Dimensions.get('window');

type Tab = 'login' | 'register';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const auth = useAuth();
  const router = useRouter();

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

  const TAB_WIDTH = (width - 60) / 2;
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_WIDTH],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Image Section */}
      <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={styles.headerImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(18,18,18,1)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>FnB Manager</Text>
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
      <View style={styles.tabContainer}>
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
      </View>

      {/* Form Area */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success popup — lives here so it persists after switching to Login tab */}
        <SuccessPopup
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
          autoDismissMs={5000}
        />

        {activeTab === 'login'
          ? <Login loading={loading} setLoading={setLoading} />
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
  tabContainer: {
    paddingHorizontal: 30,
    marginTop: 20,
    marginBottom: 8,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
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
    color: 'white',
  },
  scrollContent: {
    paddingBottom: 40,
  },
});