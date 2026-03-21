import { cookieName } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const searchField = searchParams.get("searchField") ?? "";
    const person_GID = searchParams.get("person_GID") ?? "";
    const address_GID = searchParams.get("address_GID") ?? "";

    const params = new URLSearchParams();
    if (searchField) params.set("searchField", searchField);
    if (person_GID) params.set("person_GID", person_GID);
    if (address_GID) params.set("address_GID", address_GID);

    const backendUrl = `${baseUrl}/api/search-erp-contacts?${params.toString()}`;

    const res = await fetch(backendUrl, {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return NextResponse.json({ ok: false, message: text || "Search failed" }, { status: res.status });
    }
}
