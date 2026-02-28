import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

// ensure base URL never has a trailing slash; prevents `//` when paths are appended
const BASE_URL =
  (process.env.EXPO_PUBLIC_BASE_URL || "http://192.168.137.1:2999").replace(/\/$/, "");

export interface CustomError {
  status?: number;
  message: string;
  originalError: AxiosError;
}

export class ApiClientService {
  private instance: AxiosInstance;

  constructor(baseURL: string = BASE_URL, timeout: number = 50000) {
    this.instance = axios.create({
      baseURL,
      timeout,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // ✅ attach token
    this.instance.interceptors.request.use((config) => {
      // Don't use async in request interceptor - use promise chain instead
      return SecureStore.getItemAsync("token")
        .then((token) => {
          if (token) config.headers.Authorization = `Bearer ${token}`;
          return config;
        })
        .catch((err) => {
          console.warn("Failed to get token from SecureStore:", err);
          return config;
        });
    });

    // ✅ handle error
    this.instance.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const status = error.response?.status;

        if (status === 401) {
          await SecureStore.deleteItemAsync("token");
          // AuthProvider sẽ tự redirect
        }

        const customError: CustomError = {
          status,
          message:
            (error.response?.data as any)?.message ||
            error.message ||
            "API error",
          originalError: error,
        };

        return Promise.reject(customError);
      }
    );
  }

  getClient() {
    return this.instance;
  }
}

export const apiClient = new ApiClientService().getClient();