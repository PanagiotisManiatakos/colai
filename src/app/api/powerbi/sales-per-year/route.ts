import { cookieName, decodeUserInfoCookie, userCookieName } from "@/lib/auth";
import {
  resolveBiReportPowerBiTargetFromRequest,
  resolveBiReportSellerContext,
  type SalesPerYearRow,
} from "@/lib/bi-reports/biReports";
import {
  escapeDaxString,
  executePowerBiQuery,
  POWERBI_NO_CACHE_HEADERS,
  PowerBiRequestError,
  type PowerBiExecuteQueriesResponse,
} from "@/lib/bi-reports/powerBi";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function buildSalesPerYearQuery(sellerCode: string): string {
  const escapedSellerCode = escapeDaxString(sellerCode);

  return `EVALUATE SUMMARIZECOLUMNS(FILTER('U Sales Person', 'U Sales Person'[SellerCode] = "${escapedSellerCode}"), "Total Coloplast Sales", [Total Coloplast Sales], "Total CLP Target", [Total CLP Target], "Total CLP Sales Forecast", [Total CLP Sales Forecast], "% Total CLP Cover", [% Total CLP Cover], "OC PER", [OC PER], "OC PER Target", [OC PER Target], "OC PER Forecast", [OC PER Forecast], "% OC Cover", [% OC Cover], "IC PER NEW", [IC PER NEW], "IC PER Target New", [IC PER Target New], "Genadyne Sales", [Genadyne Sales], "GENADYNE Target", [GENADYNE Target Sales], "% COVER GENADYNE", [% COVER GENADYNE], "UNO Sales", [UNO Sales], "UNO Target Sales", [UNO Target Sales], "% COVER UNO", [% COVER UNO])`;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeSalesPerYearRows(
  response: PowerBiExecuteQueriesResponse,
): SalesPerYearRow[] {
  const rows = response.results?.[0]?.tables?.[0]?.rows ?? [];

  return rows.map((row) => ({
    totalColoplastSales: toNullableNumber(row["[Total Coloplast Sales]"]),
    totalClpTarget: toNullableNumber(row["[Total CLP Target]"]),
    totalClpSalesForecast: toNullableNumber(row["[Total CLP Sales Forecast]"]),
    totalClpCover: toNullableNumber(row["[% Total CLP Cover]"]),
    ocPer: toNullableNumber(row["[OC PER]"]),
    ocPerTarget: toNullableNumber(row["[OC PER Target]"]),
    ocPerForecast: toNullableNumber(row["[OC PER Forecast]"]),
    ocCover: toNullableNumber(row["[% OC Cover]"]),
    icPerNew: toNullableNumber(row["[IC PER NEW]"]),
    icPerTargetNew: toNullableNumber(row["[IC PER Target New]"]),
    genadyneSales: toNullableNumber(row["[Genadyne Sales]"]),
    genadyneTarget: toNullableNumber(row["[GENADYNE Target]"]),
    genadyneCover: toNullableNumber(row["[% COVER GENADYNE]"]),
    unoSales: toNullableNumber(row["[UNO Sales]"]),
    unoTargetSales: toNullableNumber(row["[UNO Target Sales]"]),
    unoCover: toNullableNumber(row["[% COVER UNO]"]),
  }));
}

export async function GET(req: Request) {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  const userInfo = decodeUserInfoCookie(jar.get(userCookieName)?.value);
  const seller = resolveBiReportSellerContext(userInfo);
  if (!seller) {
    return NextResponse.json(
      { ok: false, message: "Missing seller code for authenticated user" },
      { status: 400, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  let data: PowerBiExecuteQueriesResponse;
  try {
    data = await executePowerBiQuery(
      buildSalesPerYearQuery(seller.sellerCode),
      resolveBiReportPowerBiTargetFromRequest(req, "sales_year"),
      { amsaAccessToken: token },
    );
  } catch (err) {
    const status = err instanceof PowerBiRequestError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Power BI request failed";

    return NextResponse.json(
      { ok: false, message },
      { status, headers: POWERBI_NO_CACHE_HEADERS },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      sellerCode: seller.sellerCode,
      sellerName: seller.sellerName,
      records: normalizeSalesPerYearRows(data),
    },
    { headers: POWERBI_NO_CACHE_HEADERS },
  );
}
