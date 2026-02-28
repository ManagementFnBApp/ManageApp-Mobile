import { apiClient } from '../configs/axios';


export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    expiredTime: string;
    token: string;
    user_id: number;
  };
  message: string;
   "statusCode":200
}

export const login = async (data: LoginDto): Promise<LoginResponse> => {
  // `apiClient` already has baseURL configured via configs/axios.ts.
  // Use relative paths so the interceptor and baseURL logic stays consistent.
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
};

// Register
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
}

export const register = async (data: RegisterDto): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>("/auth/register", data);
  //console.log("Register response:", response.data);
  return response.data;
};

// Forgot Password
export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = async (data: ForgotPasswordDto): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
  return response.data;
};

// Reset Password
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async (data: ResetPasswordDto): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
  return response.data;
};

// Logout
export const handleLogout = () => {
  if (typeof window !== 'undefined') {
    // 1. Xóa token cũ (nếu bạn lưu ở localStorage/sessionStorage)
    localStorage.removeItem('accessToken');

    // 2. Lấy đường dẫn hiện tại để sau khi login xong thì quay lại
    const currentPath = window.location.pathname;

    // 3. Chặn vòng lặp: Nếu đang ở trang login rồi thì không redirect nữa
    if (currentPath === '/auth') {
      return;
    }

    // 4. Chuyển hướng kèm theo param ?next=...
    // encodeURIComponent để đảm bảo URL không bị lỗi ký tự đặc biệt
    window.location.href = `/auth?next=${encodeURIComponent(currentPath)}`;
  }
};