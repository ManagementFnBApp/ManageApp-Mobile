import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import * as authApi from '@/apis/auth';
import ErrorPopup from '@/components/Notifications/Error';


const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

interface RegisterProps {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess: (message: string) => void;
}

export default function Register({ loading, setLoading, onSuccess }: RegisterProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const showError = (msg: string) => setErrorMessage(msg);
    const clearError = () => setErrorMessage(null);

    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleRegister = async () => {
        clearError();

        if (!username || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authApi.register({ username, email, password });

            resetForm();
            onSuccess('Account created successfully! Please log in.');
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 409) {
                showError(error.response?.data?.message || 'Username or email already exists');
            } else if (error.response?.status === 400) {
                showError(error.response?.data?.message || 'Invalid registration data');
            } else {
                showError(error.message || 'An error occurred during registration');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.formContainer}>
            {/* Error popup */}
            <ErrorPopup
                message={errorMessage}
                onDismiss={clearError}
                autoDismissMs={4000}
            />

            {/* Username */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                    <FontAwesome name="user" size={20} color="#aaa" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Username"
                        placeholderTextColor="#aaa"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                    <FontAwesome name="envelope" size={18} color="#aaa" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Email"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                    <FontAwesome name="lock" size={20} color="#aaa" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        placeholderTextColor="#aaa"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                        <FontAwesome
                            name={showPassword ? 'eye-slash' : 'eye'}
                            size={18}
                            color="#aaa"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                    <FontAwesome name="lock" size={20} color="#aaa" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        placeholderTextColor="#aaa"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                        <FontAwesome
                            name={showConfirmPassword ? 'eye-slash' : 'eye'}
                            size={18}
                            color="#aaa"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Register button */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        paddingHorizontal: 30,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f5f7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e8eaed',
        paddingHorizontal: 15,
        height: 55,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#111',
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: GREEN,
        borderRadius: 12,
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});