import { AppUser, getManagedUsers } from "@/apis/adminAPI";
import { getShiftAssignments, ShiftAssignment } from "@/apis/ShiftAPI";
import { useRouter } from "expo-router";
import {
    UserCog,
    UserPlus,
    Users
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────
type ShiftTab = 'Morning' | 'Noon' | 'Afternoon' | 'Evening';
const SHIFT_TABS: ShiftTab[] = ['Morning', 'Noon', 'Afternoon', 'Evening'];

// Maps ShiftTab display names → backend shift_name values
const SHIFT_NAME_MAP: Record<ShiftTab, string> = {
    Morning: 'SÁNG',
    Noon: 'TRƯA',
    Afternoon: 'CHIỀU',
    Evening: 'TỐI',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar: React.FC<{ member: AppUser }> = ({ member }) => {
    const initials = (member.profile?.full_name || member.username || '?')
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const colors = ['#b7e4c7', '#a9d6e5', '#f4d03f', '#f1948a', '#c39bd3'];
    const color = colors[member.user_id % colors.length];

    return (
        <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
            {member.role === 'SHOPOWNER' && (
                <View style={styles.managerBadge} />
            )}
        </View>
    );
};

const StaffCard: React.FC<{
    member: AppUser;
    onUnassign: (id: string) => void;
}> = ({ member, onUnassign }) => (
    <View style={styles.staffCard}>
        <View style={styles.staffLeft}>
            <Avatar member={member} />
            <View style={styles.staffInfo}>
                <Text style={styles.staffName}>
                    {member.profile?.full_name || member.username}
                </Text>
                <Text style={styles.staffRole}>{member.role}</Text>
            </View>
        </View>
        {/* Unassign button — uncomment when ready
        <TouchableOpacity
            style={styles.unassignBtn}
            onPress={() => onUnassign(String(member.user_id))}
            activeOpacity={0.7}
        >
            <Text style={styles.unassignText}>Unassign</Text>
        </TouchableOpacity> */}
    </View>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const SchedulePage: React.FC = () => {
    const [staff, setStaff] = useState<AppUser[]>([]);
    const [allShift, setAllShift] = useState<ShiftAssignment[]>([]);
    const [activeShift, setActiveShift] = useState<ShiftTab>('Morning');
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // ── Data fetching ──────────────────────────────────────────────────────────

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allStaffs, allTheShift] = await Promise.all([
                getManagedUsers(),
                getShiftAssignments(),
            ]);
            setStaff(allStaffs);
            setAllShift(allTheShift);
        } catch (err) {
            console.warn('SchedulePage: failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Empty dependency array — fetch only on mount, not on every state change
    useEffect(() => {
        fetchData();
    }, []);

    // ── Derived data ───────────────────────────────────────────────────────────

    // Get the shift assignments for the active tab, then resolve full AppUser objects
    const currentStaff: AppUser[] = allShift
        .filter(s => s.shift_name === SHIFT_NAME_MAP[activeShift])
        .map(s => staff.find(u => u.user_id === s.user_id))
        .filter((u): u is AppUser => Boolean(u));

    // ── Handlers ───────────────────────────────────────────────────────────────

    // Removes a shift assignment locally (optimistic update)
    const handleUnassign = (userId: string) => {
        setAllShift(prev =>
            prev.filter(
                s =>
                    !(
                        String(s.user_id) === userId &&
                        s.shift_name === SHIFT_NAME_MAP[activeShift]
                    )
            )
        );
    };

    const AssignStaffBtn = () => {
        router.push({ pathname: '/(tabs)/Schedule/AssignStaff', params: { shift_tab: activeShift } });
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Work Schedule</Text>
                <TouchableOpacity
                    style={styles.calendarBtn}
                    activeOpacity={0.7}
                    onPress={() => router.push('/Schedule/allStaff')}
                >
                    <UserCog size={20} color="#2596BE" strokeWidth={2} />
                </TouchableOpacity>
            </View>

            {/* ── Shift Tabs ── */}
            <View style={styles.tabRow}>
                {SHIFT_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tabItem}
                        onPress={() => setActiveShift(tab)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabLabel, activeShift === tab && styles.tabLabelActive]}>
                            {tab}
                        </Text>
                        {activeShift === tab && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Content ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Staff Assigned</Text>
                    <View style={styles.membersBadge}>
                        <Text style={styles.membersCount}>
                            {currentStaff.length} Member{currentStaff.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {/* Staff List */}
                {loading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color="#2596BE" />
                        <Text style={styles.emptyText}>Loading...</Text>
                    </View>
                ) : currentStaff.length > 0 ? (
                    currentStaff.map(member => (
                        <StaffCard
                            key={member.user_id}
                            member={member}
                            onUnassign={handleUnassign}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Users size={40} color="#d0d0d0" />
                        <Text style={styles.emptyText}>No staff assigned</Text>
                    </View>
                )}

                {/* Create New Account Button */}
                <TouchableOpacity
                    style={styles.createBtn}
                    activeOpacity={0.85}
                    onPress={AssignStaffBtn}
                >
                    <UserPlus size={18} color="#fff" strokeWidth={2.5} style={{ marginRight: 8 }} />
                    <Text style={styles.createBtnText}>Assign Staff</Text>
                </TouchableOpacity>

                <Text style={styles.createHint}>Add more staff members to your workspace</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const PRIMARY = '#2596BE';
const SURFACE = '#f7f8fa';
const TEXT_DARK = '#1a1a2e';
const TEXT_MID = '#6b7280';
const TEXT_LIGHT = '#b0b0b0';
const BORDER = '#efefef';

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: TEXT_DARK,
        letterSpacing: 0.2,
    },
    calendarBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#e8faf1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: TEXT_MID,
    },
    tabLabelActive: {
        color: PRIMARY,
        fontWeight: '700',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '15%',
        right: '15%',
        height: 3,
        borderRadius: 2,
        backgroundColor: PRIMARY,
    },
    scroll: {
        flex: 1,
        backgroundColor: SURFACE,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT_DARK,
        letterSpacing: 0.1,
    },
    membersBadge: {
        backgroundColor: '#e8faf1',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    membersCount: {
        fontSize: 12,
        fontWeight: '600',
        color: PRIMARY,
    },
    staffCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    staffLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginRight: 12,
    },
    avatarInitials: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a2e',
        opacity: 0.75,
    },
    managerBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: PRIMARY,
        borderWidth: 2,
        borderColor: '#fff',
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontSize: 14,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 2,
    },
    staffRole: {
        fontSize: 12,
        color: TEXT_MID,
        fontWeight: '400',
    },
    unassignBtn: {
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#fff',
    },
    unassignText: {
        fontSize: 12,
        fontWeight: '600',
        color: TEXT_MID,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: TEXT_LIGHT,
        fontWeight: '500',
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY,
        borderRadius: 14,
        paddingVertical: 15,
        marginTop: 10,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    createBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    createHint: {
        textAlign: 'center',
        fontSize: 12,
        color: TEXT_LIGHT,
        marginTop: 10,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    navLabel: {
        fontSize: 10,
        color: TEXT_LIGHT,
        fontWeight: '500',
        marginTop: 2,
    },
    navLabelActive: {
        color: PRIMARY,
        fontWeight: '700',
    },
});

export default SchedulePage;