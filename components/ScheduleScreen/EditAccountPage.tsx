// import { Role, ShiftTab } from '@/apis/ScheduleAPI';
// import {
//     ArrowLeft,
//     Briefcase,
//     Eye,
//     EyeOff,
//     Save,
//     ShoppingBag,
//     Trash2,
// } from 'lucide-react-native';
// import React, { useState } from 'react';
// import {
//     Alert,
//     KeyboardAvoidingView,
//     Platform,
//     Pressable,
//     SafeAreaView,
//     ScrollView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';

// interface ShiftOption {
//     key: ShiftTab;
//     label: string;
//     time: string;
// }

// export interface StaffAccount {
//     id: string;
//     fullName: string;
//     email: string;
//     role: Role;
//     shifts: ShiftTab[];
//     initials: string;
//     avatarColor: string;
// }

// interface EditAccountPageProps {
//     account?: StaffAccount;         // pass existing account; falls back to mock
//     onSave?: (updated: StaffAccount) => void;
//     onDelete?: (id: string) => void;
//     onBack?: () => void;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const SHIFTS: ShiftOption[] = [
//     { key: 'Morning',   label: 'Morning',   time: '06:00 - 12:00' },
//     { key: 'Afternoon', label: 'Afternoon', time: '12:00 - 18:00' },
//     { key: 'Night',     label: 'Night',     time: '18:00 - 00:00' },
//     { key: 'Midnight',  label: 'Midnight',  time: '00:00 - 06:00' },
// ];

// // Mock data – used when no `account` prop is provided
// const MOCK_ACCOUNT: StaffAccount = {
//     id: '1',
//     fullName: 'Sarah Williams',
//     email: 'sarah.williams@fnb-app.com',
//     role: 'STAFF',
//     shifts: ['Morning', 'Afternoon'],
//     initials: 'SW',
//     avatarColor: '#FFAAA5',
// };

// // ─── Sub-components ───────────────────────────────────────────────────────────

// const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
//     <View style={styles.sectionTitleWrap}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
//     </View>
// );

// const InputField: React.FC<{
//     label: string;
//     placeholder: string;
//     value: string;
//     onChangeText: (v: string) => void;
//     secureTextEntry?: boolean;
//     keyboardType?: 'default' | 'email-address';
//     rightIcon?: React.ReactNode;
//     editable?: boolean;
// }> = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, rightIcon, editable = true }) => (
//     <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>{label}</Text>
//         <View style={[styles.inputWrapper, !editable && styles.inputWrapperDisabled]}>
//             <TextInput
//                 style={[styles.input, !editable && styles.inputDisabled]}
//                 placeholder={placeholder}
//                 placeholderTextColor={TEXT_PLACEHOLDER}
//                 value={value}
//                 onChangeText={onChangeText}
//                 secureTextEntry={secureTextEntry}
//                 keyboardType={keyboardType ?? 'default'}
//                 autoCapitalize="none"
//                 editable={editable}
//             />
//             {rightIcon && <View style={styles.inputRight}>{rightIcon}</View>}
//         </View>
//     </View>
// );

// const RoleButton: React.FC<{
//     role: Role;
//     selected: boolean;
//     onPress: () => void;
// }> = ({ role, selected, onPress }) => (
//     <TouchableOpacity
//         style={[styles.roleBtn, selected && styles.roleBtnActive]}
//         onPress={onPress}
//         activeOpacity={0.8}
//     >
//         {role === 'STAFF' ? (
//             <Briefcase
//                 size={16}
//                 color={selected ? PRIMARY : TEXT_MID}
//                 strokeWidth={2}
//                 style={{ marginRight: 6 }}
//             />
//         ) : (
//             <ShoppingBag
//                 size={16}
//                 color={selected ? PRIMARY : TEXT_MID}
//                 strokeWidth={2}
//                 style={{ marginRight: 6 }}
//             />
//         )}
//         <Text style={[styles.roleBtnText, selected && styles.roleBtnTextActive]}>
//             {role === 'STAFF' ? 'Staff' : 'Shop Owner'}
//         </Text>
//     </TouchableOpacity>
// );

// const ShiftCard: React.FC<{
//     shift: ShiftOption;
//     selected: boolean;
//     onPress: () => void;
// }> = ({ shift, selected, onPress }) => (
//     <TouchableOpacity
//         style={[styles.shiftCard, selected && styles.shiftCardActive]}
//         onPress={onPress}
//         activeOpacity={0.8}
//     >
//         <View style={[styles.checkbox, selected && styles.checkboxActive]}>
//             {selected && <View style={styles.checkboxInner} />}
//         </View>
//         <View style={styles.shiftInfo}>
//             <Text style={[styles.shiftLabel, selected && styles.shiftLabelActive]}>
//                 {shift.label}
//             </Text>
//             <Text style={[styles.shiftTime, selected && styles.shiftTimeActive]}>
//                 {shift.time}
//             </Text>
//         </View>
//     </TouchableOpacity>
// );

// // ─── Avatar preview ───────────────────────────────────────────────────────────

// const AvatarPreview: React.FC<{ initials: string; color: string; name: string; role: string }> = ({
//     initials, color, name, role,
// }) => (
//     <View style={styles.avatarRow}>
//         <View style={[styles.avatarCircle, { backgroundColor: color }]}>
//             <Text style={styles.avatarInitials}>{initials}</Text>
//         </View>
//         <View style={styles.avatarMeta}>
//             <Text style={styles.avatarName}>{name || 'Full Name'}</Text>
//             <Text style={styles.avatarRole}>{role === 'ShopOwner' ? 'Shop Owner' : 'Staff'}</Text>
//         </View>
//     </View>
// );

// // ─── Main Component ────────────────────────────────────────────────────────────

// const EditAccountPage: React.FC<EditAccountPageProps> = ({
//     account = MOCK_ACCOUNT,
//     onSave,
//     onDelete,
//     onBack,
// }) => {
//     const [fullName, setFullName]         = useState(account.fullName);
//     const [email, setEmail]               = useState(account.email);
//     const [password, setPassword]         = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [role, setRole]                 = useState<Role>(account.role);
//     const [selectedShifts, setSelectedShifts] = useState<Set<ShiftTab>>(
//         new Set(account.shifts)
//     );

//     const toggleShift = (key: ShiftTab) => {
//         setSelectedShifts(prev => {
//             const next = new Set(prev);
//             next.has(key) ? next.delete(key) : next.add(key);
//             return next;
//         });
//     };

//     const handleSave = () => {
//         if (!fullName.trim()) {
//             Alert.alert('Validation', 'Full name is required.');
//             return;
//         }
//         const updated: StaffAccount = {
//             ...account,
//             fullName,
//             email,
//             role,
//             shifts: Array.from(selectedShifts) as ShiftTab[],
//         };
//         onSave?.(updated);
//         console.log('Saved:', updated);
//     };

//     const handleDelete = () => {
//         Alert.alert(
//             'Remove Member',
//             `Are you sure you want to remove ${account.fullName}?`,
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                     text: 'Remove',
//                     style: 'destructive',
//                     onPress: () => {
//                         onDelete?.(account.id);
//                         console.log('Deleted:', account.id);
//                     },
//                 },
//             ]
//         );
//     };

//     return (
//         <SafeAreaView style={styles.safe}>
//             <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//             {/* ── Header ── */}
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
//                     <ArrowLeft size={20} color={TEXT_DARK} strokeWidth={2.5} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Edit Member</Text>
//                 {/* Delete shortcut in header */}
//                 <TouchableOpacity style={styles.deleteHeaderBtn} onPress={handleDelete} activeOpacity={0.7}>
//                     <Trash2 size={18} color="#ef4444" strokeWidth={2} />
//                 </TouchableOpacity>
//             </View>

//             <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//             >
//                 <ScrollView
//                     style={styles.scroll}
//                     contentContainerStyle={styles.scrollContent}
//                     showsVerticalScrollIndicator={false}
//                     keyboardShouldPersistTaps="handled"
//                 >
//                     {/* ── Avatar preview ── */}
//                     <AvatarPreview
//                         initials={account.initials}
//                         color={account.avatarColor}
//                         name={fullName}
//                         role={role}
//                     />

//                     {/* ── Personal Information ── */}
//                     <SectionTitle title="Personal Information" />

//                     <InputField
//                         label="Full Name"
//                         placeholder="e.g. John Doe"
//                         value={fullName}
//                         onChangeText={setFullName}
//                     />
//                     <InputField
//                         label="Email / Username"
//                         placeholder="john.doe@fnb-app.com"
//                         value={email}
//                         onChangeText={setEmail}
//                         keyboardType="email-address"
//                     />
//                     <InputField
//                         label="New Password"
//                         placeholder="Leave blank to keep current"
//                         value={password}
//                         onChangeText={setPassword}
//                         secureTextEntry={!showPassword}
//                         rightIcon={
//                             <Pressable onPress={() => setShowPassword(p => !p)} hitSlop={8}>
//                                 {showPassword
//                                     ? <EyeOff size={18} color={TEXT_PLACEHOLDER} strokeWidth={1.8} />
//                                     : <Eye    size={18} color={TEXT_PLACEHOLDER} strokeWidth={1.8} />
//                                 }
//                             </Pressable>
//                         }
//                     />

//                     {/* ── Role ── */}
//                     <SectionTitle title="Role" />
//                     <View style={styles.roleRow}>
//                         <RoleButton role="STAFF"     selected={role === 'STAFF'}     onPress={() => setRole('STAFF')} />
//                         <RoleButton role="SHOPOWNER" selected={role === 'SHOPOWNER'} onPress={() => setRole('SHOPOWNER')} />
//                     </View>

//                     {/* ── Shift Assignment ── */}
//                     <SectionTitle
//                         title="Shift Assignment"
//                         subtitle="Select one or more shifts for this member"
//                     />
//                     <View style={styles.shiftGrid}>
//                         {SHIFTS.map(shift => (
//                             <ShiftCard
//                                 key={shift.key}
//                                 shift={shift}
//                                 selected={selectedShifts.has(shift.key)}
//                                 onPress={() => toggleShift(shift.key)}
//                             />
//                         ))}
//                     </View>

//                     <View style={{ height: 100 }} />
//                 </ScrollView>
//             </KeyboardAvoidingView>

//             {/* ── Footer Actions ── */}
//             <View style={styles.footer}>
//                 <TouchableOpacity style={styles.cancelBtn} onPress={onBack} activeOpacity={0.7}>
//                     <Text style={styles.cancelText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
//                     <Save size={16} color="#fff" strokeWidth={2.5} style={{ marginRight: 6 }} />
//                     <Text style={styles.saveText}>Save Changes</Text>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// };

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const PRIMARY          = '#35d07f';
// const PRIMARY_LIGHT    = '#e8faf1';
// const TEXT_DARK        = '#1a1a2e';
// const TEXT_MID         = '#6b7280';
// const TEXT_PLACEHOLDER = '#b0b8c4';
// const BORDER           = '#efefef';
// const SURFACE          = '#f7f8fa';

// const styles = StyleSheet.create({
//     safe: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },

//     // Header
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: BORDER,
//         backgroundColor: '#fff',
//     },
//     backBtn: {
//         width: 36,
//         height: 36,
//         borderRadius: 10,
//         backgroundColor: SURFACE,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     headerTitle: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: TEXT_DARK,
//         letterSpacing: 0.2,
//     },
//     deleteHeaderBtn: {
//         width: 36,
//         height: 36,
//         borderRadius: 10,
//         backgroundColor: '#fef2f2',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },

//     // Avatar preview
//     avatarRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: SURFACE,
//         borderRadius: 16,
//         padding: 14,
//         marginBottom: 22,
//         borderWidth: 1.5,
//         borderColor: BORDER,
//     },
//     avatarCircle: {
//         width: 52,
//         height: 52,
//         borderRadius: 26,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginRight: 14,
//     },
//     avatarInitials: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#1a1a2e',
//         opacity: 0.7,
//     },
//     avatarMeta: {
//         flex: 1,
//     },
//     avatarName: {
//         fontSize: 15,
//         fontWeight: '700',
//         color: TEXT_DARK,
//         marginBottom: 3,
//     },
//     avatarRole: {
//         fontSize: 12,
//         color: PRIMARY,
//         fontWeight: '600',
//     },

//     // Scroll
//     scroll: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },
//     scrollContent: {
//         paddingHorizontal: 16,
//         paddingTop: 20,
//     },

//     // Section title
//     sectionTitleWrap: {
//         marginBottom: 14,
//         marginTop: 4,
//     },
//     sectionTitle: {
//         fontSize: 15,
//         fontWeight: '700',
//         color: TEXT_DARK,
//         letterSpacing: 0.1,
//     },
//     sectionSubtitle: {
//         fontSize: 12,
//         color: TEXT_MID,
//         marginTop: 3,
//         fontWeight: '400',
//     },

//     // Input
//     inputGroup: {
//         marginBottom: 14,
//     },
//     inputLabel: {
//         fontSize: 13,
//         fontWeight: '600',
//         color: TEXT_DARK,
//         marginBottom: 6,
//     },
//     inputWrapper: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: SURFACE,
//         borderRadius: 12,
//         borderWidth: 1.5,
//         borderColor: BORDER,
//         paddingHorizontal: 14,
//     },
//     inputWrapperDisabled: {
//         opacity: 0.6,
//     },
//     input: {
//         flex: 1,
//         fontSize: 14,
//         color: TEXT_DARK,
//         paddingVertical: Platform.OS === 'ios' ? 13 : 10,
//         fontWeight: '400',
//     },
//     inputDisabled: {
//         color: TEXT_MID,
//     },
//     inputRight: {
//         paddingLeft: 8,
//     },

//     // Role
//     roleRow: {
//         flexDirection: 'row',
//         gap: 10,
//         marginBottom: 22,
//     },
//     roleBtn: {
//         flex: 1,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 12,
//         borderRadius: 12,
//         borderWidth: 1.5,
//         borderColor: BORDER,
//         backgroundColor: SURFACE,
//     },
//     roleBtnActive: {
//         borderColor: PRIMARY,
//         backgroundColor: PRIMARY_LIGHT,
//     },
//     roleBtnText: {
//         fontSize: 13,
//         fontWeight: '600',
//         color: TEXT_MID,
//     },
//     roleBtnTextActive: {
//         color: PRIMARY,
//     },

//     // Shifts
//     shiftGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 10,
//         marginBottom: 8,
//     },
//     shiftCard: {
//         width: '47.5%',
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 12,
//         paddingVertical: 12,
//         borderRadius: 12,
//         borderWidth: 1.5,
//         borderColor: BORDER,
//         backgroundColor: SURFACE,
//         gap: 10,
//     },
//     shiftCardActive: {
//         borderColor: PRIMARY,
//         backgroundColor: PRIMARY_LIGHT,
//     },
//     checkbox: {
//         width: 20,
//         height: 20,
//         borderRadius: 6,
//         borderWidth: 2,
//         borderColor: '#d0d5dd',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#fff',
//     },
//     checkboxActive: {
//         borderColor: PRIMARY,
//         backgroundColor: PRIMARY,
//     },
//     checkboxInner: {
//         width: 8,
//         height: 8,
//         borderRadius: 2,
//         backgroundColor: '#fff',
//     },
//     shiftInfo: {
//         flex: 1,
//     },
//     shiftLabel: {
//         fontSize: 13,
//         fontWeight: '700',
//         color: TEXT_DARK,
//         marginBottom: 2,
//     },
//     shiftLabelActive: {
//         color: PRIMARY,
//     },
//     shiftTime: {
//         fontSize: 11,
//         color: TEXT_MID,
//         fontWeight: '400',
//     },
//     shiftTimeActive: {
//         color: PRIMARY,
//         opacity: 0.8,
//     },

//     // Footer
//     footer: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         flexDirection: 'row',
//         gap: 10,
//         paddingHorizontal: 16,
//         paddingTop: 12,
//         paddingBottom: Platform.OS === 'ios' ? 32 : 16,
//         backgroundColor: '#fff',
//         borderTopWidth: 1,
//         borderTopColor: BORDER,
//     },
//     cancelBtn: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 14,
//         borderRadius: 14,
//         borderWidth: 1.5,
//         borderColor: BORDER,
//         backgroundColor: SURFACE,
//     },
//     cancelText: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: TEXT_MID,
//     },
//     saveBtn: {
//         flex: 2,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 14,
//         borderRadius: 14,
//         backgroundColor: PRIMARY,
//         shadowColor: PRIMARY,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 4,
//     },
//     saveText: {
//         fontSize: 14,
//         fontWeight: '700',
//         color: '#fff',
//         letterSpacing: 0.3,
//     },
// });

// export default EditAccountPage;