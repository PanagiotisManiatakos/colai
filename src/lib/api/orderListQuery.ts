export const DEFAULT_ORDER_LIST_PAGE = 1;
export const DEFAULT_ORDER_LIST_PAGE_SIZE = 30;

export type OrderListQuery = {
  search?: string;
  page?: number;
  pagesize?: number;
};

export function buildOrderListSearchParams(
  query: OrderListQuery & { _ts?: number } = {},
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? DEFAULT_ORDER_LIST_PAGE));
  params.set(
    "pagesize",
    String(query.pagesize ?? DEFAULT_ORDER_LIST_PAGE_SIZE),
  );

  const search = query.search?.trim();
  if (search) params.set("search", search);

  if (query._ts) params.set("_ts", String(query._ts));

  return params;
}
