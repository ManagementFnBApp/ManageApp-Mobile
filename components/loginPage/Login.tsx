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



const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";
const { width } = Dimensions.get('window');

export default function Login({ loading, setLoading, handleLogin }: { loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>>; handleLogin: (username: string, password: string) => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Username or Email</Text>
                <View style={styles.inputWrapper}>
                    <FontAwesome name="user" size={20} color="#aaa" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Username or Email"
                        placeholderTextColor="#aaa"
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
                    {/* <TouchableOpacity>
                        <Text style={styles.forgotText}>Forgot?</Text>
                    </TouchableOpacity> */}
                </View>
                <View style={styles.inputWrapper}>
                    <FontAwesome name="lock" size={20} color="#aaa" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        placeholderTextColor="#aaa"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </View>

            {/* login action button */}
            <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin(username, password)}>
                <Text style={styles.loginButtonText}>Login</Text>
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
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
    forgotText: {
        color: GREEN,
        fontWeight: '600',
    },
    loginButton: {
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
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});