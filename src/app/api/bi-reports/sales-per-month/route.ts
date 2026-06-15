import {
  cookieName,
  decodeUserInfoCookie,
  userCookieName,
} from "@/lib/auth";
import { normalizeSellerCode } from "@/lib/sellerAccess";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DATASET_ID =
  process.env.POWERBI_DATASET_ID ?? "e928997c-ad45-4320-a7d6-b35a8fa8e510";
const GROUP_ID =
  process.env.POWERBI_GROUP_ID?.trim() ||
  process.env.POWERBI_WORKSPACE_ID?.trim() ||
  "";
const POWERBI_SCOPE = "https://analysis.windows.net/powerbi/api/.default";
const POWERBI_NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

type PowerBiExecuteQueriesResponse = {
  results?: Array<{
    tables?: Array<{
      rows?: Array<Record<string, unknown>>;
    }>;
  }>;
};

type PowerBiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    ["pbi.error"]?: {
      code?: string;
      details?: unknown[];
      parameters?: Record<string, unknown>;
    };
  };
  message?: string;
};

function getUserDisplayName(
  userInfo: ReturnType<typeof decodeUserInfoCookie>,
): string {
  return (
    [userInfo?.fname, userInfo?.lname].filter(Boolean).join(" ").trim() ||
    userInfo?.username?.trim() ||
    ""
  );
}

function escapeDaxString(value: string): string {
  return value.replaceAll('"', '""');
}

function buildSalesPerMonthQuery(sellerCode: string): string {
  const escapedSellerCode = escapeDaxString(sellerCode);

  return `EVALUATE SUMMARIZECOLUMNS('U Sales Person'[SellerCode], 'U Sales Person'[Πωλητής], 'Calendar'[Month], FILTER('U Sales Person', 'U Sales Person'[SellerCode] = "${escapedSellerCode}"), "Sales", 'Dax measures'[Sales])`;
}

function getPowerBiExecuteQueriesEndpoint(): string {
  const datasetPath = `datasets/${DATASET_ID}/executeQueries`;
  if (GROUP_ID) {
    return `https://api.powerbi.com/v1.0/myorg/groups/${GROUP_ID}/${datasetPath}`;
  }

  return `https://api.powerbi.com/v1.0/myorg/${datasetPath}`;
}

function getPowerBiErrorMessage(
  data: PowerBiExecuteQueriesResponse | PowerBiErrorResponse,
  status: number,
): string {
  if ("error" in data && data.error) {
    const code =
      data.error.code ||
      data.error["pbi.error"]?.code ||
      `HTTP ${status}`;
    const detail =
      data.error.message ||
      ("message" in data && data.message ? data.message : "");

    return detail
      ? `Power BI executeQueries failed (${code}): ${detail}`
      : `Power BI executeQueries failed (${code}, HTTP ${status})`;
  }

  if ("message" in data && data.message) {
    return `Power BI executeQueries failed (HTTP ${status}): ${data.message}`;
  }

  if (status === 404) {
    return "Power BI executeQueries failed (404). Check POWERBI_DATASET_ID, POWERBI_GROUP_ID / POWERBI_WORKSPACE_ID, and whether the app has access to the workspace.";
  }

  return `Power BI executeQueries failed (HTTP ${status})`;
}

async function getPowerBiAccessToken(): Promise<string> {
  const staticToken = process.env.POWERBI_ACCESS_TOKEN?.trim();
  if (staticToken) return staticToken;

  const tenantId = process.env.POWERBI_TENANT_ID?.trim();
  const clientId = process.env.POWERBI_CLIENT_ID?.trim();
  const clientSecret = process.env.POWERBI_CLIENT_SECRET?.trim();

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Missing Power BI configuration. Set POWERBI_TENANT_ID, POWERBI_CLIENT_ID and POWERBI_CLIENT_SECRET.",
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: POWERBI_SCOPE,
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    },
  );

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    error_description?: string;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to get Power BI access token",
    );
  }

  return data.access_token;
}

function normalizePowerBiRows(
  response: PowerBiExecuteQueriesResponse,
  fallback: { sellerCode: string; sellerName: string },
) {
  const rows = response.results?.[0]?.tables?.[0]?.rows ?? [];

  return rows.map((row) => {
    const sellerCode =
      String(row["U Sales Person[SellerCode]"] ?? fallback.sellerCode).trim() ||
      fallback.sellerCode;
    const sellerName =
      String(row["U Sales Person[Πωλητής]"] ?? fallback.sellerName).trim() ||
      fallback.sellerName;
    const month = String(row["Calendar[Month]"] ?? "").trim();
    const sales = Number(row["[Sales]"] ?? 0);

    return {
      sellerCode,
      sellerName,
      month,
      sales: Number.isFinite(sales) ? sales : 0,
    };
  });
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  const userInfo = decodeUserInfoCookie(jar.get(userCookieName)?.value);
  const sellerCode = normalizeSellerCode(userInfo?.sellerCode);
  if (!sellerCode) {
    return NextResponse.json(
      { ok: false, message: "Missing seller code for authenticated user" },
      { status: 400, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  let accessToken: string;
  try {
    accessToken = await getPowerBiAccessToken();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get Power BI token";
    return NextResponse.json(
      { ok: false, message },
      { status: 500, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  const endpoint = getPowerBiExecuteQueriesEndpoint();

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queries: [{ query: buildSalesPerMonthQuery(sellerCode) }],
        serializerSettings: { includeNulls: true },
      }),
      cache: "no-store",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Power BI request failed";
    return NextResponse.json(
      { ok: false, message },
      { status: 502, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as
    | PowerBiExecuteQueriesResponse
    | PowerBiErrorResponse;

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, message: getPowerBiErrorMessage(data, upstream.status) },
      { status: upstream.status, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  const sellerName = getUserDisplayName(userInfo);
  const records = normalizePowerBiRows(data as PowerBiExecuteQueriesResponse, {
    sellerCode,
    sellerName,
  });

  return NextResponse.json(
    {
      ok: true,
      sellerCode,
      sellerName: records[0]?.sellerName || sellerName,
      records,
    },
    { headers: POWERBI_NO_CACHE_HEADERS },
  );
}
