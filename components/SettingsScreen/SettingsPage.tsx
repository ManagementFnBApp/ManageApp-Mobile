import { useAuth } from '@/providers/AuthProvider';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#35d07f';
const BG = '#f7f8fa';
const CARD = '#ffffff';
const BORDER = '#e8eaed';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#888888';
const TEXT_LABEL = '#aaaaaa';

type SettingRowProps = {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    right?: React.ReactNode;
    danger?: boolean;
};

function SettingRow({ icon, label, onPress, right, danger }: SettingRowProps) {
    return (
        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.rowIcon}>{icon}</View>
            <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
            <View style={styles.rowRight}>
                {right ?? <Feather name="chevron-right" size={16} color={TEXT_SECONDARY} />}
            </View>
        </TouchableOpacity>
    );
}

type SectionProps = {
    title: string;
    children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionCard}>{children}</View>
        </View>
    );
}

export default function SettingsPage() {
    const auth = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    
    useEffect(() => {
        if (auth?.user) {
            console.log('role: ', auth.user)
            setUsername(auth.user.username);
            if (auth.user.role === 'SHOPOWNER') {
                setUserRole('Shop Owner');
            }
        }
    }, [auth?.user]);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    await auth?.logout();
                    router.replace('/loginPage');
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Feather name="arrow-left" size={20} color={TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="notifications-outline" size={20} color={TEXT_PRIMARY} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Profile */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.avatarEdit}>
                            <Feather name="edit-2" size={10} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>{username}</Text>
                    <Text style={styles.profileRole}>{userRole ?? 'User'}</Text>
                    <Text style={styles.profileId}>Restaurant ID: #12345</Text>
                </View>

                {/* Account Settings */}
                <Section title="ACCOUNT SETTINGS">
                    <SettingRow
                        icon={<Feather name="user" size={18} color={GREEN} />}
                        label="Profile Information"
                        onPress={() => router.push('/Menu')}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Feather name="lock" size={18} color={GREEN} />}
                        label="Change Password"
                        onPress={() => router.push('/Menu')}
                    />
                </Section>

                {/* Restaurant Management */}
                <Section title="RESTAURANT MANAGEMENT">
                    <SettingRow
                        icon={<MaterialIcons name="storefront" size={18} color={GREEN} />}
                        label="Restaurant Info"
                        onPress={() => router.push('/Menu')}
                    />
                    <View style={styles.divider} />
                    {/* <SettingRow
                        icon={<MaterialCommunityIcons name="table-chair" size={18} color={GREEN} />}
                        label="Table Layout"
                        onPress={() => router.push('/Menu')}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Feather name="clock" size={18} color={GREEN} />}
                        label="Business Hours"
                        onPress={() => router.push('/Menu')}
                    /> */}
                </Section>

                {/* App Settings
                <Section title="APP SETTINGS">
                    <SettingRow
                        icon={<Ionicons name="notifications-outline" size={18} color={GREEN} />}
                        label="Notifications"
                        right={
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: BORDER, true: GREEN }}
                                thumbColor="#fff"
                                style={styles.switch}
                            />
                        }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Feather name="globe" size={18} color={GREEN} />}
                        label="Language"
                        onPress={() => router.push('/Menu')}
                        right={
                            <View style={styles.rowRightGroup}>
                                <Text style={styles.rowRightText}>English</Text>
                                <Feather name="chevron-right" size={16} color={TEXT_SECONDARY} />
                            </View>
                        }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Feather name="moon" size={18} color={GREEN} />}
                        label="Dark Mode"
                        right={
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                                trackColor={{ false: BORDER, true: GREEN }}
                                thumbColor="#fff"
                                style={styles.switch}
                            />
                        }
                    />
                </Section> */}

                {/* Support */}
                <Section title="SUPPORT">
                    <SettingRow
                        icon={<Feather name="help-circle" size={18} color={GREEN} />}
                        label="Help Center"
                        onPress={() => router.push('/Menu')}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Feather name="file-text" size={18} color={GREEN} />}
                        label="Terms of Service"
                        onPress={() => router.push('/Menu')}
                    />
                </Section>

                {/* Log Out */}
                <View style={styles.section}>
                    <View style={styles.sectionCard}>
                        <SettingRow
                            icon={<MaterialIcons name="logout" size={18} color="#e74c3c" />}
                            label="Log Out"
                            onPress={handleLogout}
                            danger
                            right={null}
                        />
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: TEXT_PRIMARY,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    scroll: {
        paddingHorizontal: 16,
    },

    // Profile
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 8,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: GREEN,
    },
    avatarEdit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BG,
    },
    profileName: {
        color: TEXT_PRIMARY,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    profileRole: {
        color: TEXT_SECONDARY,
        fontSize: 13,
        marginBottom: 4,
    },
    profileId: {
        color: GREEN,
        fontSize: 12,
        fontWeight: '500',
    },

    // Section
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: TEXT_LABEL,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 8,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: CARD,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: BORDER,
    },

    // Row
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    rowIcon: {
        width: 28,
        alignItems: 'center',
        marginRight: 14,
    },
    rowLabel: {
        flex: 1,
        color: TEXT_PRIMARY,
        fontSize: 14,
        fontWeight: '500',
    },
    rowLabelDanger: {
        color: '#e74c3c',
    },
    rowRight: {
        alignItems: 'flex-end',
    },
    rowRightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rowRightText: {
        color: TEXT_SECONDARY,
        fontSize: 13,
    },
    switch: {
        transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
    },

    divider: {
        height: 1,
        backgroundColor: BORDER,
        marginLeft: 58,
    },
});