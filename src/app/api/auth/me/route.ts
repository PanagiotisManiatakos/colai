import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "amsa_token";

export async function GET() {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json({ ok: true, authenticated: false });
    }

    // Minimal: just confirm session exists.
    // Later you can call a backend /me endpoint if Swagger provides one.
    return NextResponse.json({
        ok: true,
        authenticated: true,
        user: { username: "user" },
    });
}
