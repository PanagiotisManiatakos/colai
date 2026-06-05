export const cookieName = "session-colai";
export const userCookieName = "amsa_user";

export async function verifySession(token?: string | null) {
    // Replace with your real validation logic.
    // Keep this server-safe (Node runtime), not middleware-edge unless using jose.
    return Boolean(token);
}
