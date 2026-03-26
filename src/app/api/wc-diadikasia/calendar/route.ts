import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";

export async function GET(req: Request) {
    const jar = cookies();
    const token = (await jar).get(cookieName)?.value;

    if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const incoming = new URL(req.url);
    const searchfield = incoming.searchParams.get("searchfield")?.trim() ?? "";

    const upstream = new URL(`${process.env.AMSA_API_BASE_URL}/api/wc-diadikasia-calendar`);
    if (searchfield) {
        upstream.searchParams.set("searchfield", searchfield);
    }

    const res = await fetch(upstream.toString(), {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const json = await res.json().catch((e) => ({ ok: false, message: e.message }));
        return NextResponse.json(
            { ok: false, message: json || "Backend orders fetch failed" },
            { status: res.status }
        );
    }

    const payload = await res.json().catch((e) => ({ ok: false, message: e.message }));

    return NextResponse.json({ ok: true, ...payload });
}
