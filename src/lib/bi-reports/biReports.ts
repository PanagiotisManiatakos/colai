import type { PowerBiDatasetTarget } from "@/lib/bi-reports/powerBi";
import { normalizeSellerCode } from "@/lib/sellerAccess";
import type { ApiUserInfo } from "@/types/api/schemas";

const DEFAULT_POWERBI_WORKSPACE_ID = "a279f8cd-3d0e-4362-af29-2e5af5b043d1";
const MAVROGENIS_SALES_DATASET_ID = "e928997c-ad45-4320-a7d6-b35a8fa8e510";

export type BiReportSellerContext = {
  sellerCode: string;
  sellerName: string;
};

export type BiReportPowerBiTargetKey = "sales" | "sales_year" | "akrateia";

export type MonthlySalesRow = {
  sellerCode: string;
  sellerName: string;
  month: string;
  sales: number;
};

export type AkrateiaRow = {
  month: string;
  ccNewSales: number | null;
  ccRepSales: number | null;
  sales: number | null;
  ccSalesTarget: number | null;
  ccSalesCoverCM: number | null;
  ccNewPeri: number | null;
  ccNewPerTarget: number | null;
  ccNewPerCoverCM: number | null;
  ccEktel: number | null;
  ccEktelTarget: number | null;
  ccEktelTotalPerRunning: number | null;
};

export type SalesPerYearRow = {
  totalColoplastSales: number | null;
  totalClpTarget: number | null;
  totalClpSalesForecast: number | null;
  totalClpCover: number | null;
  ocPer: number | null;
  ocPerTarget: number | null;
  ocPerForecast: number | null;
  ocCover: number | null;
  icPerNew: number | null;
  icPerTargetNew: number | null;
  genadyneSales: number | null;
  genadyneTarget: number | null;
  genadyneCover: number | null;
  unoSales: number | null;
  unoTargetSales: number | null;
  unoCover: number | null;
};

export type ReportTile = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  href: string;
};

export type SalesPerMonthResponse = {
  ok: true;
  sellerCode: string;
  sellerName: string;
  records: MonthlySalesRow[];
};

export type AkrateiaResponse = {
  ok: true;
  sellerCode: string;
  sellerName: string;
  records: AkrateiaRow[];
};

export type SalesPerYearResponse = {
  ok: true;
  sellerCode: string;
  sellerName: string;
  records: SalesPerYearRow[];
};

function readPowerBiEnv(name: string): string {
  return process.env[name]?.trim() || "";
}

export function resolveBiReportPowerBiTarget(
  key: BiReportPowerBiTargetKey,
): Required<PowerBiDatasetTarget> {
  const workspaceId =
    readPowerBiEnv(`POWERBI_${key.toUpperCase()}_WORKSPACE_ID`) ||
    readPowerBiEnv(`POWERBI_${key.toUpperCase()}_GROUP_ID`) ||
    readPowerBiEnv("POWERBI_WORKSPACE_ID") ||
    readPowerBiEnv("POWERBI_GROUP_ID") ||
    DEFAULT_POWERBI_WORKSPACE_ID;

  const datasetId =
    readPowerBiEnv(`POWERBI_${key.toUpperCase()}_DATASET_ID`) ||
    readPowerBiEnv("POWERBI_DATASET_ID") ||
    MAVROGENIS_SALES_DATASET_ID;

  return { datasetId, workspaceId };
}

export function getUserDisplayName(userInfo: ApiUserInfo | null): string {
  return (
    [userInfo?.fname, userInfo?.lname].filter(Boolean).join(" ").trim() ||
    userInfo?.username?.trim() ||
    ""
  );
}

export function resolveBiReportSellerContext(
  userInfo: ApiUserInfo | null,
): BiReportSellerContext | null {
  const sellerCode = normalizeSellerCode(userInfo?.sellerCode);
  if (sellerCode) {
    return {
      sellerCode,
      sellerName: getUserDisplayName(userInfo),
    };
  }

  return null;
}
