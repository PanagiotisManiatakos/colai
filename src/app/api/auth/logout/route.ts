import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "amsa_token";

export async function POST() {
    const jar = await cookies();
    jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return NextResponse.json({ ok: true });
}
