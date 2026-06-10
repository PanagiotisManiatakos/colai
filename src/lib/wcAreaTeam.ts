import type { ApiUserInfo } from "@/types/api/schemas";

function readUserInfoString(
  userInfo: ApiUserInfo | null | undefined,
  fieldName: string,
): string | null {
  if (!userInfo || typeof userInfo !== "object") return null;

  const target = fieldName.toLowerCase();
  for (const [key, value] of Object.entries(userInfo)) {
    if (key.toLowerCase() !== target) continue;
    if (value == null) continue;
    const trimmed = String(value).trim();
    if (trimmed) return trimmed;
  }

  return null;
}

/** Prefer travmaArea; fall back to travmaTeam when area is empty. */
export function resolveAreaTeamFromUserInfo(
  userInfo: ApiUserInfo | null | undefined,
): string | null {
  const travmaArea = readUserInfoString(userInfo, "travmaArea");
  if (travmaArea) return travmaArea;

  return readUserInfoString(userInfo, "travmaTeam");
}
