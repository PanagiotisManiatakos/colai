import { cookieName, userCookieName } from "@/lib/auth";
import type { ApiUserInfo } from "@/types/api/schemas";
import type { SellerSalesWC } from "@/types/api/sqlData";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SQL_APP_ID = "1305";
const SQL_NAME = "ORDER_LIST_WC";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

function getObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function getArray(value: unknown): SellerSalesWC[] | null {
  return Array.isArray(value) ? (value as SellerSalesWC[]) : null;
}

function extractRecords(payload: unknown): SellerSalesWC[] {
  const body = getObject(payload);
  const data = getObject(body?.data);

  return (
    getArray(body?.rows) ??
    getArray(body?.items) ??
    getArray(body?.result) ??
    getArray(body?.data) ??
    getArray(data?.mydata) ??
    getArray(data?.rows) ??
    getArray(data?.items) ??
    getArray(data?.result) ??
    []
  );
}

function getUpstreamErrorMessage(payload: unknown): string | null {
  const body = getObject(payload);
  if (!body) return null;

  const success = body.success;
  if (success === false || success === "false") {
    return String(body.error ?? body.message ?? "SQL data service failed");
  }

  const statusCode = Number(body.statusCode);
  if (Number.isFinite(statusCode) && statusCode !== 0 && statusCode !== 200) {
    return String(body.message ?? body.detailedMessage ?? "SQL data service failed");
  }

  return null;
}

function parseJsonText(text: string): unknown {
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function countReplacementChars(text: string): number {
  return (text.match(/\uFFFD/g) ?? []).length;
}

function decodeResponseText(buffer: ArrayBuffer, contentType: string | null): string {
  const charset = contentType?.match(/charset=([^;\s]+)/i)?.[1]?.trim();
  if (charset) {
    try {
      return new TextDecoder(charset).decode(buffer);
    } catch {
      // Fall through to UTF-8 with Windows-1253 fallback.
    }
  }

  const utf8 = new TextDecoder("utf-8").decode(buffer);
  if (!utf8.includes("\uFFFD")) return utf8;

  try {
    const windows1253 = new TextDecoder("windows-1253").decode(buffer);
    return countReplacementChars(windows1253) < countReplacementChars(utf8)
      ? windows1253
      : utf8;
  } catch {
    return utf8;
  }
}

function decodeUserInfoCookie(value?: string): ApiUserInfo | null {
  if (!value) return null;

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);
    return getObject(parsed) ? (parsed as ApiUserInfo) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401, headers: noCacheHeaders },
    );
  }

  const userInfo = decodeUserInfoCookie(jar.get(userCookieName)?.value);
  const sellerCode = userInfo?.sellerCode?.trim();
  if (!sellerCode) {
    return NextResponse.json(
      { ok: false, message: "Missing seller code for authenticated user" },
      { status: 400, headers: noCacheHeaders },
    );
  }

  const serviceUrl = process.env.SQL_DATA_SERVICE_URL;
  const clientID = process.env.SQL_DATA_CLIENT_ID;

  if (!serviceUrl || !clientID) {
    return NextResponse.json(
      { ok: false, message: "Missing SQL data config" },
      { status: 500, headers: noCacheHeaders },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: "SqlData",
        clientID,
        appId: SQL_APP_ID,
        SqlName: SQL_NAME,
        SELLERCODE: sellerCode,
      }),
      cache: "no-store",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "SQL data service request failed";
    return NextResponse.json(
      { ok: false, message },
      { status: 502, headers: noCacheHeaders },
    );
  }

  const text = await upstream
    .arrayBuffer()
    .then((buffer) => decodeResponseText(buffer, upstream.headers.get("content-type")))
    .catch(() => "");
  const payload = parseJsonText(text);

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, message: text || "SQL data service failed" },
      { status: upstream.status, headers: noCacheHeaders },
    );
  }

  if (payload === null) {
    return NextResponse.json(
      { ok: false, message: text || "Invalid SQL data service response" },
      { status: 502, headers: noCacheHeaders },
    );
  }

  const upstreamMessage = getUpstreamErrorMessage(payload);
  if (upstreamMessage) {
    return NextResponse.json(
      { ok: false, message: upstreamMessage },
      { status: 502, headers: noCacheHeaders },
    );
  }

  return NextResponse.json(
    { ok: true, records: extractRecords(payload) },
    { headers: noCacheHeaders },
  );
}
