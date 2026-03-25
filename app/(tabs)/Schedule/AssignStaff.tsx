import { AppUser, getManagedUsers } from '@/apis/adminAPI';
import { assignShift, getShiftAssignments, ShiftAssignment } from '@/apis/ShiftAPI';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, UserCheck, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Constants ─────────────────────────────────────────────────────────────────

type ShiftTab = 'Morning' | 'Noon' | 'Afternoon' | 'Evening';

const SHIFT_TABS: ShiftTab[] = ['Morning', 'Noon', 'Afternoon', 'Evening'];

const SHIFT_NAME_MAP: Record<ShiftTab, string> = {
    Morning: 'SÁNG',
    Noon: 'TRƯA',
    Afternoon: 'CHIỀU',
    Evening: 'TỐI',
};

// Map ShiftTab → shift_id (adjust to match your backend)
const SHIFT_ID_MAP: Record<ShiftTab, number> = {
    Morning: 1,
    Noon: 2,
    Afternoon: 3,
    Evening: 4,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Date → 'YYYY-MM-DD' in local time */
const toLocalDateString = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatDisplay = (d: Date): string =>
    d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

// ─── Avatar ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#b7e4c7', '#a9d6e5', '#f4d03f', '#f1948a', '#c39bd3'];

const Avatar: React.FC<{ member: AppUser }> = ({ member }) => {
    const initials = (member.profile?.full_name || member.username || '?')
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const bg = AVATAR_COLORS[member.user_id % AVATAR_COLORS.length];

    return (
        <View style={[styles.avatar, { backgroundColor: bg }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
    );
};

// ─── Staff Row ─────────────────────────────────────────────────────────────────

const StaffRow: React.FC<{
    member: AppUser;
    selected: boolean;
    onSelect: () => void;
}> = ({ member, selected, onSelect }) => (
    <TouchableOpacity
        style={[styles.staffRow, selected && styles.staffRowSelected]}
        onPress={onSelect}
        activeOpacity={0.75}
    >
        <Avatar member={member} />
        <View style={styles.staffInfo}>
            <Text style={styles.staffName}>
                {member.profile?.full_name || member.username}
            </Text>
            <Text style={styles.staffRole}>{member.role}</Text>
        </View>
        {/* Radio button */}
        <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected && <View style={styles.radioDot} />}
        </View>
    </TouchableOpacity>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────

/**
 * Route params:
 *   shift_tab — 'Morning' | 'Noon' | 'Afternoon' | 'Evening'  (active tab from SchedulePage)
 */
const AssignStaffScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ shift_tab: string }>();

    const initialTab = (
        SHIFT_TABS.includes(params.shift_tab as ShiftTab) ? params.shift_tab : 'Morning'
    ) as ShiftTab;

    // ── State ──────────────────────────────────────────────────────────────────
    const [allStaff, setAllStaff] = useState<AppUser[]>([]);
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [activeTab, setActiveTab] = useState<ShiftTab>(initialTab);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [users, shifts] = await Promise.all([
                getManagedUsers(),
                getShiftAssignments(),
            ]);
            setAllStaff(users);
            setAssignments(shifts);
        } catch (err) {
            console.warn('AssignStaff: fetch error', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Reset selection when tab or date changes
    useEffect(() => { setSelectedUserId(null); }, [activeTab, selectedDate]);

    // ── Derived ────────────────────────────────────────────────────────────────

    /** User IDs already assigned to this shift on this date */
    const assignedIds = useMemo<Set<number>>(() => {
        const dateStr = toLocalDateString(selectedDate);
        return new Set(
            assignments
                .filter(
                    a =>
                        a.shift_id === SHIFT_ID_MAP[activeTab] &&
                        a.date === dateStr
                )
                .map(a => a.user_id)
        );
    }, [assignments, activeTab, selectedDate]);

    /** Staff not yet assigned to this shift on this date */
    const availableStaff = useMemo(
        () => allStaff.filter(u => !assignedIds.has(u.user_id)),
        [allStaff, assignedIds]
    );

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleDateChange = (_: unknown, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) setSelectedDate(date);
    };

    const handleConfirm = async () => {
        if (selectedUserId === null) {
            Alert.alert('No staff selected', 'Please select a staff member first.');
            return;
        }

        setSubmitting(true);
        try {
            await assignShift({
                shift_id: SHIFT_ID_MAP[activeTab],
                user_id: selectedUserId,
                date: toLocalDateString(selectedDate),
            });

            const selected = allStaff.find(u => u.user_id === selectedUserId);
            const name = selected?.profile?.full_name || selected?.username || 'Staff';

            Alert.alert(
                'Assigned!',
                `${name} has been assigned to the ${activeTab} shift on ${formatDisplay(selectedDate)}.`,
                [{ text: 'Done', onPress: () => router.back() }]
            );
        } catch (err) {
            Alert.alert('Failed', 'Could not assign staff. Please try again.');
            console.warn('AssignStaff: assign error', err);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={22} color="#1a1a2e" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assign Staff</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* ── Shift Tabs ── */}
            <View style={styles.tabRow}>
                {SHIFT_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tabItem}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                            {tab}
                        </Text>
                        {activeTab === tab && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Date Picker Row ── */}
            <View style={styles.dateRow}>
                <Calendar size={16} color={PRIMARY} strokeWidth={2} />
                <Text style={styles.dateLabel}>Date</Text>
                <TouchableOpacity
                    style={styles.dateBtn}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.dateBtnText}>{formatDisplay(selectedDate)}</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* ── Staff List ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Staff</Text>
                    {!loading && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {availableStaff.length} available
                            </Text>
                        </View>
                    )}
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={PRIMARY} />
                        <Text style={styles.centerText}>Loading staff…</Text>
                    </View>
                ) : availableStaff.length === 0 ? (
                    <View style={styles.center}>
                        <Users size={40} color="#d0d0d0" />
                        <Text style={styles.centerText}>
                            All staff already assigned for this shift
                        </Text>
                    </View>
                ) : (
                    availableStaff.map(member => (
                        <StaffRow
                            key={member.user_id}
                            member={member}
                            selected={selectedUserId === member.user_id}
                            onSelect={() =>
                                setSelectedUserId(prev =>
                                    prev === member.user_id ? null : member.user_id
                                )
                            }
                        />
                    ))
                )}
            </ScrollView>

            {/* ── Footer ── */}
            <View style={styles.footer}>
                {selectedUserId !== null && (
                    <Text style={styles.selectionHint}>
                        {allStaff.find(u => u.user_id === selectedUserId)?.profile?.full_name ||
                            allStaff.find(u => u.user_id === selectedUserId)?.username}{' '}
                        → {activeTab} · {formatDisplay(selectedDate)}
                    </Text>
                )}
                <TouchableOpacity
                    style={[
                        styles.confirmBtn,
                        (submitting || selectedUserId === null) && styles.confirmBtnDisabled,
                    ]}
                    onPress={handleConfirm}
                    activeOpacity={0.85}
                    disabled={submitting || selectedUserId === null}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <UserCheck
                                size={18}
                                color="#fff"
                                strokeWidth={2.5}
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.confirmBtnText}>Confirm Assignment</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const PRIMARY = '#2596BE';
const PRIMARY_LIGHT = '#e8f6fb';
const SURFACE = '#f7f8fa';
const TEXT_DARK = '#1a1a2e';
const TEXT_MID = '#6b7280';
const TEXT_LIGHT = '#b0b0b0';
const BORDER = '#efefef';

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: SURFACE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT_DARK,
        letterSpacing: 0.2,
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
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        gap: 8,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT_DARK,
        flex: 1,
    },
    dateBtn: {
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    dateBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: PRIMARY,
    },
    scroll: {
        flex: 1,
        backgroundColor: SURFACE,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: TEXT_DARK,
    },
    badge: {
        backgroundColor: '#e8faf1',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#22c55e',
    },
    staffRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    staffRowSelected: {
        borderColor: PRIMARY,
        backgroundColor: PRIMARY_LIGHT,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitials: {
        fontSize: 14,
        fontWeight: '700',
        color: TEXT_DARK,
        opacity: 0.75,
    },
    staffInfo: { flex: 1 },
    staffName: {
        fontSize: 14,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 2,
    },
    staffRole: {
        fontSize: 12,
        color: TEXT_MID,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    radioSelected: {
        borderColor: PRIMARY,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PRIMARY,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    centerText: {
        fontSize: 14,
        color: TEXT_LIGHT,
        fontWeight: '500',
        textAlign: 'center',
    },
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        gap: 8,
    },
    selectionHint: {
        textAlign: 'center',
        fontSize: 12,
        color: PRIMARY,
        fontWeight: '600',
    },
    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY,
        borderRadius: 14,
        paddingVertical: 15,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmBtnDisabled: {
        backgroundColor: '#b0cfe0',
        shadowOpacity: 0,
        elevation: 0,
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

export default AssignStaffScreen;