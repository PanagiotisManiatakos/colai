import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, userCookieName } from "@/lib/auth";
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

export async function GET() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;

  if (!token) {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  const userInfos = decodeUserInfoCookie(jar.get(userCookieName)?.value);

  return NextResponse.json({
    ok: true,
    authenticated: true,
    userInfos,
    user: userInfos
      ? { username: userInfos.username ?? "user" }
      : { username: "user" },
  });
}
