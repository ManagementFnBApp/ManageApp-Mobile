import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import * as authApi from '@/apis/auth';
import ErrorPopup from '@/components/Notifications/Error';
import { useAuth } from '@/providers/AuthProvider';


const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#35d07f";
const { width } = Dimensions.get('window');

export default function Login({ loading, setLoading }: { loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const auth = useAuth();
    const { login } = auth!;

    const showError = (msg: string) => setErrorMessage(msg);
    const clearError = () => setErrorMessage(null);

    const handleLogin = async () => {
        clearError();
        setLoading(true);
        try {
            const res = await authApi.login({ username, password });

            const tokenValue = (res as any).data.token;
            if (typeof tokenValue !== 'string') {
                console.warn('Login response token is not a string, converting:', tokenValue);
            }
            await login(tokenValue as any);
        } catch (error: any) {
            // We wrap errors from the API in a `CustomError` object (see configs/axios.ts).
            // That object does not have `response` but does expose `status` and `message`.
            // Preserve the original error for debugging.
            console.error('Login error', error);

            const status: number | undefined =
                error.status ?? error.response?.status;
            const message: string =
                error.message || error.response?.data?.message || 'An error occurred during login';

            if (status === 401) {
                showError(message || 'Invalid credentials');
            } else if (status === 500) {
                // you might also inspect error.originalError?.response?.data
                showError('Server error – please try again later');
            } else {
                showError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Username or Email</Text>
                <View style={styles.inputWrapper}>
                    <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Username or Email"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
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

            {/* login action button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Error popup */}
            <ErrorPopup
                message={errorMessage}
                onDismiss={clearError}
                autoDismissMs={4000}
            />
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