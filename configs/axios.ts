import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { authEvents } from "./authEvents"; // 👈 add this (see below)

// Ensure base URL never has a trailing slash
const BASE_URL = (
  process.env.EXPO_PUBLIC_BASE_URL || "http://192.168.137.1:2999"
).replace(/\/$/, "");

console.log("BASE_URL:", BASE_URL);

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
    // ─── Request: attach token ─────────────────────────────────────────────
    this.instance.interceptors.request.use(
      (config) =>
        SecureStore.getItemAsync("accessToken") // ✅ fixed key: 'token' → 'accessToken'
          .then((token) => {
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
          })
          .catch((err) => {
            console.warn("Failed to get token from SecureStore:", err);
            return config;
          }),
      (error) => Promise.reject(error)
    );

    // ─── Response: handle errors ───────────────────────────────────────────
    this.instance.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data as any;

        if (status === 401) {
          await SecureStore.deleteItemAsync("accessToken"); // ✅ fixed key
          authEvents.emit("logout"); // ✅ notify AuthProvider to clear state
        }

        if (status === 500) {
          console.error(
            "Server error:",
            data?.message ?? data?.error ?? "Internal server error"
          );
        }

        const customError: CustomError = {
          status,
          message:
            // Handle array of messages (e.g. NestJS class-validator errors)
            Array.isArray(data?.message)
              ? data.message.join(", ")
              : data?.message || error.message || "API error",
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