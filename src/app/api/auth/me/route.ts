import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";


export async function GET() {
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;

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
