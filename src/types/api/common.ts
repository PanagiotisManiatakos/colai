/** Standard Next.js proxy failure envelope. */
export type ApiFailure = {
  ok: false;
  message?: string;
  detailedMessage?: string | null;
};

/** Standard Next.js proxy success envelope. */
export type ApiSuccess<T extends Record<string, unknown> = Record<string, never>> =
  { ok: true } & T;

export type ApiResult<T extends Record<string, unknown>> =
  | ApiSuccess<T>
  | ApiFailure;

export type SelectListGroup = {
  disabled: boolean;
  name?: string | null;
};

export type SelectListItem = {
  disabled: boolean;
  group?: SelectListGroup | null;
  selected: boolean;
  text?: string | null;
  value?: string | null;
};

export type KatigoriaParoxisItem = SelectListItem & {
  plafonAmount: number;
  plafonGiftAmount: number;
};

export type PagingResults = {
  totalpages?: number | null;
  totalrecords?: number | null;
  currentPage?: number | null;
  currentPagesize?: number | null;
  searchFunction?: string | null;
  currentPageHtmlElementId?: string | null;
  itemsidentifier?: string | null;
};

/** Backend `ToastMessage` schema. */
export type ToastMessage = {
  result: boolean;
  message?: string | null;
  type?: string | null;
  exmessage?: string | null;
  redirectlink?: string | null;
  backtopreviouspage: boolean;
  misc1?: string | null;
  misc2?: string | null;
  misc3?: string | null;
  misc4?: string | null;
  misc5?: string | null;
  misc6?: string | null;
  dataobject?: unknown;
};

export type ConsentUploadDataObject = {
  form_score?: number;
};

export type StatusEnvelope = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
};
