// export type ShiftTab = 'Morning' | 'Noon' | 'Afternoon' | 'Midnight';

// export type Role = 'STAFF' | 'SHOPOWNER';

// export interface StaffAccount {
//     id: string;
//     fullName: string;
//     email: string;
//     role: Role;
//     shifts: ShiftTab[];
//     initials?: string;
//     avatar?: string;
//     avatarColor: string;
// }

// // ─── Mock Data ─────────────────────────────────────────────────────────────────

// // const STAFF_BY_SHIFT: Record<ShiftTab, StaffAccount[]> = {
// //     Morning: [
// //         { id: '1', fullName: 'John Doe',        email: 'john.doe@fnb-app.com',        role: 'SHOPOWNER', shifts: ['Morning'],            initials: 'JD', avatarColor: '#FFD580' },
// //         { id: '2', fullName: 'Sarah Jenkins',   email: 'sarah.jenkins@fnb-app.com',   role: 'STAFF',     shifts: ['Morning', 'Afternoon'], initials: 'SJ', avatarColor: '#FFAAA5' },
// //         { id: '3', fullName: 'Michael Chen',    email: 'michael.chen@fnb-app.com',    role: 'STAFF',     shifts: ['Morning'],            initials: 'MC', avatarColor: '#A8D8EA' },
// //         { id: '4', fullName: 'Elena Rodriguez', email: 'elena.rodriguez@fnb-app.com', role: 'STAFF',     shifts: ['Morning', 'Night'],   initials: 'ER', avatarColor: '#C9B1FF' },
// //     ],
// //     Afternoon: [
// //         { id: '5', fullName: 'Liam Torres',  email: 'liam.torres@fnb-app.com',  role: 'SHOPOWNER', shifts: ['Afternoon'],            initials: 'LT', avatarColor: '#B5EAD7' },
// //         { id: '6', fullName: 'Priya Sharma', email: 'priya.sharma@fnb-app.com', role: 'STAFF',     shifts: ['Afternoon', 'Morning'], initials: 'PS', avatarColor: '#FFDAC1' },
// //     ],
// //     Night: [
// //         { id: '7', fullName: 'Omar Hassan', email: 'omar.hassan@fnb-app.com', role: 'SHOPOWNER', shifts: ['Night'],              initials: 'OH', avatarColor: '#C7CEEA' },
// //         { id: '8', fullName: 'Yuki Tanaka', email: 'yuki.tanaka@fnb-app.com', role: 'STAFF',     shifts: ['Night', 'Midnight'], initials: 'YT', avatarColor: '#E2F0CB' },
// //         { id: '9', fullName: 'Dana Kim',    email: 'dana.kim@fnb-app.com',    role: 'STAFF',     shifts: ['Night'],             initials: 'DK', avatarColor: '#FFB7B2' },
// //     ],
// //     Midnight: [
// //         { id: '10', fullName: 'Carlos Vega', email: 'carlos.vega@fnb-app.com', role: 'SHOPOWNER', shifts: ['Midnight'], initials: 'CV', avatarColor: '#D4A5A5' },
// //     ],
// // };

// // export const SHIFT_TABS: ShiftTab[] = ['Morning', 'Afternoon', 'Night', 'Midnight'];

// export const getAllStaffs = async (): Promise<Record<ShiftTab, StaffAccount[]>> => {
//     return STAFF_BY_SHIFT;
// };

// export const getAllStaffList = async (): Promise<StaffAccount[]> => {
//     const seen = new Set<string>();
//     return Object.values(STAFF_BY_SHIFT).flat().filter(s => {
//         if (seen.has(s.id)) return false;
//         seen.add(s.id);
//         return true;
//     });
// };

// export const getStaffById = async (id: string): Promise<StaffAccount | undefined> => {
//     return Object.values(STAFF_BY_SHIFT).flat().find(s => s.id === id);
// };