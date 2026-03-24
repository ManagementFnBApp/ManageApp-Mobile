/** Decode JWT payload without verification (client-side only). */
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
    try {
        const base64Payload = token.split('.')[1];
        if (!base64Payload) return null;
        // Handle base64url encoding
        const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = typeof window !== 'undefined'
            ? atob(normalized)
            : Buffer.from(normalized, 'base64').toString('utf8');
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

export interface UserJwtPayload {
  id?: number;       // ← add this
  user_id?: number;
  sub?: string;
  username?: string;
  role?: string;
  exp?: number;
  shop_id?: number;          // bonus: available if you need it
  owner_manager_id?: number | null;
}
