import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../configs/axios';
import { decodeJwt, UserJwtPayload } from '../lib/jwt';
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://'

// ─── Storage Helpers ─────────────────────────────────────────────────────────

const storage = {
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  get: (key: string) => SecureStore.getItemAsync(key),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
  clear: () =>
    Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('userId'),
      SecureStore.deleteItemAsync('username'),
      SecureStore.deleteItemAsync('role'),
    ]),
};

// ─── Login ───────────────────────────────────────────────────────────────────

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  username?: string;
  token: string;
  expiredTime: number;
  role?: string | null;
}

export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const isEmail = data.username.includes('@');

  // Admin login via plain fetch to bypass axios interceptor
  if (isEmail) {
    try {
      const res = await fetch(`${BASE_URL}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.username, password: data.password }),
      });

      if (res.ok) {
        const json = await res.json();
        const adminData = json.data ?? json;

        if (adminData?.token) {
          await storage.set('accessToken', adminData.token);
          await storage.set('userId', String(adminData.adminId));
          await storage.set('username', data.username);
          await storage.set('role', 'admin');
        }

        return {
          user_id: adminData.adminId,
          username: data.username,
          token: adminData.token,
          expiredTime: adminData.expiredTime,
          role: 'admin',
        };
      }
      // Admin login failed → fall through to staff login
    } catch {
      // Network error → fall through to staff login
    }
  }

  // Staff / user login
  const response = await apiClient.post<
    { data?: { user_id: number; token: string; expiredTime: number } } &
    { user_id: number; token: string; expiredTime: number }
  >('/auth/login', { username: data.username, password: data.password });

  const authData = response.data?.data ?? response.data;

  if (authData?.token) {
    const payload = decodeJwt<UserJwtPayload>(authData.token);
    console.log('Payload: ', payload)
    const userRole = payload?.role ?? null;

    await storage.set('accessToken', authData.token);
    await storage.set('userId', String(authData.user_id));
    await storage.set('username', data.username);
    await storage.set('role', userRole ?? '');
  }

  const payload = decodeJwt<UserJwtPayload>(authData.token);

  return {
    user_id: authData.user_id,
    username: data.username,
    token: authData.token,
    expiredTime: authData.expiredTime,
    role: payload?.role ?? null,
  };
};

// ─── Register ────────────────────────────────────────────────────────────────

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user_id: number;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: Date;
}

export const register = async (data: RegisterDto): Promise<RegisterResponse> => {
  const response = await apiClient.post<
    { data?: RegisterResponse } & RegisterResponse
  >('/auth/register', {
    username: data.username.trim(),
    email: data.email.trim(),
    password: data.password,
  });

  const result = response.data?.data ?? response.data;
  return result as RegisterResponse;
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = async (
  data: ForgotPasswordDto
): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    data
  );
  return response.data;
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async (
  data: ResetPasswordDto
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(
    '/auth/reset-password',
    data
  );
  return response.data;
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const handleLogout = async (): Promise<void> => {
  await storage.clear();
};

// ─── Misc Helpers ─────────────────────────────────────────────────────────────

export const updateLocalRole = async (role: string): Promise<void> => {
  await storage.set('role', role);
};

export const getAccessToken = async (): Promise<string | null> => {
  return storage.get('accessToken');
};

export const getRole = async (): Promise<string | null> => {
  return storage.get('role');
};