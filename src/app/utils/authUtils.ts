// authUtils.ts

interface JwtPayload {
  role: string;
  userId: number;
  sub?: string; // Subject (often user's email or ID)
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export function getUserRole(token: string): string | null {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) {
    console.error("Invalid JWT: Missing payload.");
    return null;
  }
  try {
    const payloadJSON: JwtPayload = JSON.parse(atob(payload));
    return payloadJSON.role;
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

export function getUserId(token: string): number | null {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) {
    console.error("Invalid JWT: Missing payload.");
    return null;
  }
  try {
    const payloadJSON: JwtPayload = JSON.parse(atob(payload));
    return payloadJSON.userId;
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}
