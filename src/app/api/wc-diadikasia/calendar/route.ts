import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, userCookieName } from "@/lib/auth";
import { resolveAreaTeamFromUserInfo } from "@/lib/wcAreaTeam";
import type { ApiUserInfo } from "@/types/api/schemas";

function decodeUserInfoCookie(value?: string): ApiUserInfo | null {
  if (!value) return null;

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as ApiUserInfo)
      : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const incoming = new URL(req.url);
  const searchfield = incoming.searchParams.get("searchfield")?.trim() ?? "";
  const incomingAreaTeam = incoming.searchParams.get("areateam")?.trim() ?? "";
  const userInfo = decodeUserInfoCookie(jar.get(userCookieName)?.value);
  const areateam =
    incomingAreaTeam || resolveAreaTeamFromUserInfo(userInfo) || null;

  const upstream = new URL(
    `${process.env.AMSA_API_BASE_URL}/api/wc-diadikasia-calendar`,
  );
  if (searchfield) {
    upstream.searchParams.set("searchfield", searchfield);
  }
  if (areateam) {
    upstream.searchParams.set("areateam", areateam);
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
      { status: res.status },
    );
  }

  const payload = await res.json().catch((e) => ({ ok: false, message: e.message }));

  return NextResponse.json({ ok: true, ...payload });
}
