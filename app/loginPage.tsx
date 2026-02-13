import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const backgroundImage = require('../assets/images/bg.jpg');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Image Section */}
      <ImageBackground 
        source={require('../assets/images/bg.jpg')} // Replace with your local asset
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
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to manage your restaurant{"\n"}and staff operation
              </Text>
            </View>
            </View>
            
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username or Email</Text>
          <View style={styles.inputWrapper}>
            <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Username or Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <Text style={styles.dividerText}>OR</Text>
        </View>

        <View style={styles.socialContainer}>
          <Text style={styles.loginWithText}>Login With</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialIconWrapper}>
              <View style={[styles.socialBox, { backgroundColor: '#FF3B30' }]}>
                <FontAwesome name="google" size={24} color="white" />
              </View>
              <Text style={styles.socialLabel}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialIconWrapper}>
              <View style={[styles.socialBox, { backgroundColor: '#00CFFF' }]}>
                <FontAwesome name="facebook" size={24} color="white" />
              </View>
              <Text style={styles.socialLabel}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.contactAdmin}>Contact Admin</Text>
        </TouchableOpacity>
      </View>
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
    color: '#00BFFF',
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
  contactAdmin: {
    color: '#00BFFF',
    fontWeight: '600',
  },
});