import { getMyShiftAssignmentsAsOwner, ShiftAssignment } from '@/apis/ShiftAPI';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    MoreVertical,
    Pencil,
    Search,
    Trash2,
    User,
    UserPlus
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Role color map ───────────────────────────────────────────────────────────

const getRoleColor = (role: string): string => {
    if (role === 'SHOPOWNER') return PRIMARY;
    return TEXT_MID;
};

const getRoleLabel = (role: string): string => {
    if (role === 'SHOPOWNER') return 'Shop Owner';
    return 'Staff';
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ member: ShiftAssignment }> = ({ member }) => (
    <View style={[styles.avatar, { backgroundColor: '#585858' }]}>
        {1 === 1 //need to fix
            ? <User size={20} color="#aaa" strokeWidth={1.8} />
            : <Text style={styles.avatarInitials}>{member.id}</Text>
        }
    </View>
);

// ─── Staff Row ────────────────────────────────────────────────────────────────

const StaffRow: React.FC<{
    member: ShiftAssignment;
    onEdit: (member: ShiftAssignment) => void;
    onDelete: (id: string) => void;
}> = ({ member, onEdit, onDelete }) => (
    <View style={styles.staffRow}>
        <Avatar member={member} />
        <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{member.username}</Text>
            {/* <Text style={[styles.staffRole, { color: getRoleColor(member.role) }]}>
                {getRoleLabel(member.role)}
            </Text> */}
        </View>
        <View style={styles.staffActions}>
            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onEdit(member)}
                activeOpacity={0.7}
            >
                <Pencil size={16} color="#9ca3af" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onDelete(String(member.id))}
                activeOpacity={0.7}
            >
                <Trash2 size={16} color="#9ca3af" strokeWidth={2} />
            </TouchableOpacity>
        </View>
    </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AllStaffPage: React.FC = () => {
    const auth = useAuth()
    const [staff, setStaff] = useState<ShiftAssignment[]>([]);
    const [search, setSearch] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchStaff = async () => {
            const allStaffs = await getMyShiftAssignmentsAsOwner(auth?.user?.user_id);
            console.log('staff: ', allStaffs)
            setStaff(allStaffs);
        };
        fetchStaff();
    }, [auth.loading]);

    const filtered = staff.filter(m =>
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.shift_name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (member: ShiftAssignment) => {
        router.push({
            pathname: '/Schedule/editAccount',
            params: {
                id: member.id,
                fullName: member.username,
                email: member.email,
                role: member.role,
                avatarColor: member.avatarColor,
                initials: member.initials ?? '',
                shifts: JSON.stringify(member.shifts),
            },
        });
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Remove Member',
            'Are you sure you want to remove this staff member?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setStaff(prev => prev.filter(m => m.id !== Number(id))),
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
                    <ArrowLeft size={20} color={TEXT_DARK} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Management</Text>
                <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
                    <MoreVertical size={20} color={TEXT_DARK} strokeWidth={2} />
                </TouchableOpacity>
            </View>

            {/* ── Search ── */}
            <View style={styles.searchWrap}>
                <Search size={16} color={TEXT_PLACEHOLDER} strokeWidth={2} style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for staff or owners"
                    placeholderTextColor={TEXT_PLACEHOLDER}
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                />
            </View>

            {/* ── Add New Member ── */}
            <TouchableOpacity
                style={styles.addBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/Schedule/createAccount')}
            >
                <UserPlus size={18} color="#fff" strokeWidth={2.5} style={{ marginRight: 8 }} />
                <Text style={styles.addBtnText}>Add New Member</Text>
            </TouchableOpacity>

            {/* ── List ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Section header */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Staff Members & Owners</Text>
                    <View style={styles.totalBadge}>
                        <Text style={styles.totalText}>{staff.length} TOTAL</Text>
                    </View>
                </View>

                {/* Staff cards */}
                <View style={styles.listCard}>
                    {filtered.length > 0 ? (
                        filtered.map((member, index) => (
                            <React.Fragment key={member.id}>
                                <StaffRow
                                    member={member}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                                {index < filtered.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <User size={36} color="#d0d0d0" />
                            <Text style={styles.emptyText}>No members found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const PRIMARY          = '#2596BE';
const TEXT_DARK        = '#1a1a2e';
const TEXT_MID         = '#6b7280';
const TEXT_PLACEHOLDER = '#b0b8c4';
const BORDER           = '#f0f0f0';
const SURFACE          = '#f7f8fa';

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
    headerIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT_DARK,
        letterSpacing: 0.2,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 14,
        marginBottom: 10,
        backgroundColor: SURFACE,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: BORDER,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 11 : 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: TEXT_DARK,
        padding: 0,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 18,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: PRIMARY,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 4,
    },
    addBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: TEXT_DARK,
        letterSpacing: 0.1,
    },
    totalBadge: {
        backgroundColor: '#fff3e0',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    totalText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#f97316',
        letterSpacing: 0.5,
    },
    listCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: BORDER,
        overflow: 'hidden',
    },
    staffRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitials: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a2e',
        opacity: 0.7,
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
        fontWeight: '500',
    },
    staffActions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SURFACE,
    },
    divider: {
        height: 1,
        backgroundColor: BORDER,
        marginHorizontal: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: TEXT_PLACEHOLDER,
        fontWeight: '500',
    },
});

export default AllStaffPage;