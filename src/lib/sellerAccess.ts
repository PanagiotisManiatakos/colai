import type { ApiAccessSellerItem, ApiUserInfo } from "@/types/api/schemas";

export function hasSellerAccessList(
  userInfos: ApiUserInfo | null | undefined,
): boolean {
  return (userInfos?.listAccessSellers?.length ?? 0) > 0;
}

export function isActingSellerSelectionValid(
  userInfos: ApiUserInfo | null | undefined,
  actingSellerCode: string | null | undefined,
): boolean {
  if (!hasSellerAccessList(userInfos)) return true;
  return Boolean(getActingSellerCodeForApi(userInfos, actingSellerCode));
}

export function getOwnSellerCode(
  userInfos: ApiUserInfo | null | undefined,
): string {
  return userInfos?.sellerCode?.trim() ?? "";
}

export function getAccessibleSellers(
  userInfos: ApiUserInfo | null | undefined,
): ApiAccessSellerItem[] {
  const ownCode = getOwnSellerCode(userInfos);
  return (userInfos?.listAccessSellers ?? []).filter((item) => {
    const code = item.sellerCode?.trim();
    return Boolean(code) && code !== ownCode;
  });
}

export function getActingSellerCodeForApi(
  userInfos: ApiUserInfo | null | undefined,
  actingSellerCode: string | null | undefined,
): string | undefined {
  if (!hasSellerAccessList(userInfos)) return undefined;

  const selected = actingSellerCode?.trim();
  if (!selected) return undefined;

  const ownCode = getOwnSellerCode(userInfos);
  if (!ownCode || selected === ownCode) return undefined;

  const allowed = getAccessibleSellers(userInfos).some(
    (item) => item.sellerCode?.trim() === selected,
  );
  return allowed ? selected : undefined;
}

export function resolveActingSeller(
  userInfos: ApiUserInfo | null | undefined,
  actingSellerCode: string | null | undefined,
): Pick<ApiAccessSellerItem, "sellerCode" | "sellerName"> | null {
  if (!userInfos) return null;

  const ownCode = getOwnSellerCode(userInfos);
  const selected = actingSellerCode?.trim();

  if (selected && selected !== ownCode) {
    const match = getAccessibleSellers(userInfos).find(
      (item) => item.sellerCode?.trim() === selected,
    );
    if (match?.sellerCode?.trim()) {
      return {
        sellerCode: match.sellerCode.trim(),
        sellerName: match.sellerName?.trim() ?? null,
      };
    }
  }

  if (!ownCode) return null;

  const ownName =
    [userInfos.fname, userInfos.lname].filter(Boolean).join(" ").trim() ||
    userInfos.username?.trim() ||
    null;

  return { sellerCode: ownCode, sellerName: ownName };
}

export function applyActingSellerToOrder<
  T extends { sellerCode?: string; sellerName?: string },
>(
  order: T,
  userInfos: ApiUserInfo | null | undefined,
  actingSellerCode: string | null | undefined,
): T {
  const seller = resolveActingSeller(userInfos, actingSellerCode);
  if (!seller?.sellerCode) return order;

  return {
    ...order,
    sellerCode: seller.sellerCode,
    ...(seller.sellerName ? { sellerName: seller.sellerName } : {}),
  };
}

export function appendActingSellerCommentsSuffix<
  T extends { sellerComments?: string | null },
>(
  order: T,
  userInfos: ApiUserInfo | null | undefined,
  actingSellerCode: string | null | undefined,
): T {
  if (!getActingSellerCodeForApi(userInfos, actingSellerCode)) {
    return order;
  }

  const username = userInfos?.username?.trim();
  if (!username) return order;

  const existing = order.sellerComments?.trim() ?? "";
  const suffix = `καταχωρήθηκε από ${username}`;
  const sellerComments = existing ? `${existing} - ${suffix}` : suffix;

  return {
    ...order,
    sellerComments,
  };
}
