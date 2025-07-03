// authUtils.ts

export function getUserRole(token: string): any {
  if (!token) return null;
  const payload = token.split('.')[1];
  try {
    let payloadJSON = JSON.parse(atob(payload));
    return payloadJSON.role;
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

export function getUserId(token: string): any {
  if (!token) return null;
  const payload = token.split('.')[1];
  try {
    let payloadJSON = JSON.parse(atob(payload));
    return payloadJSON.userId;
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}
