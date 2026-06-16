const DEFAULT_WORKSPACE_ID = "a279f8cd-3d0e-4362-af29-2e5af5b043d1";
const DEFAULT_DATASET_ID = "e928997c-ad45-4320-a7d6-b35a8fa8e510";
const POWERBI_SCOPE = "https://analysis.windows.net/powerbi/api/.default";

export const POWERBI_NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export type PowerBiExecuteQueriesResponse = {
  results?: Array<{
    tables?: Array<{
      rows?: Array<Record<string, unknown>>;
    }>;
  }>;
};

export type PowerBiDatasetTarget = {
  datasetId?: string;
  workspaceId?: string;
};

export type PowerBiAuthInfo = {
  mode: "client_credentials" | "static_access_token" | "missing";
  tenantId: string | null;
  clientId: string | null;
  hasStaticAccessToken: boolean;
};

export type PowerBiDataset = {
  id: string;
  name: string;
  webUrl?: string;
  configuredBy?: string;
  isRefreshable?: boolean;
  isEffectiveIdentityRequired?: boolean;
  isEffectiveIdentityRolesRequired?: boolean;
  isOnPremGatewayRequired?: boolean;
  targetStorageMode?: string;
  createdDate?: string;
};

export type PowerBiGroup = {
  id: string;
  name: string;
  type?: string;
  isReadOnly?: boolean;
  isOnDedicatedCapacity?: boolean;
};

type PowerBiDatasetsResponse = {
  value?: PowerBiDataset[];
};

type PowerBiGroupsResponse = {
  value?: PowerBiGroup[];
  ["@odata.count"]?: number;
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

export class PowerBiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PowerBiRequestError";
    this.status = status;
  }
}

export function escapeDaxString(value: string): string {
  return value.replaceAll('"', '""');
}

export function getDefaultPowerBiWorkspaceId(): string {
  return (
    process.env.POWERBI_GROUP_ID?.trim() ||
    process.env.POWERBI_WORKSPACE_ID?.trim() ||
    DEFAULT_WORKSPACE_ID
  );
}

export function getDefaultPowerBiDatasetId(): string {
  return process.env.POWERBI_DATASET_ID?.trim() || DEFAULT_DATASET_ID;
}

export function getPowerBiAuthInfo(): PowerBiAuthInfo {
  const tenantId = process.env.POWERBI_TENANT_ID?.trim() || null;
  const clientId = process.env.POWERBI_CLIENT_ID?.trim() || null;
  const hasClientSecret = Boolean(process.env.POWERBI_CLIENT_SECRET?.trim());
  const hasStaticAccessToken = Boolean(
    process.env.POWERBI_ACCESS_TOKEN?.trim(),
  );

  if (hasStaticAccessToken) {
    return {
      mode: "static_access_token",
      tenantId,
      clientId,
      hasStaticAccessToken,
    };
  }

  if (tenantId && clientId && hasClientSecret) {
    return {
      mode: "client_credentials",
      tenantId,
      clientId,
      hasStaticAccessToken,
    };
  }

  return {
    mode: "missing",
    tenantId,
    clientId,
    hasStaticAccessToken,
  };
}

function getPowerBiDatasetId(target?: PowerBiDatasetTarget): string {
  return target?.datasetId?.trim() || getDefaultPowerBiDatasetId();
}

function getPowerBiWorkspaceId(target?: PowerBiDatasetTarget): string {
  return (
    target?.workspaceId?.trim() ||
    process.env.POWERBI_GROUP_ID?.trim() ||
    process.env.POWERBI_WORKSPACE_ID?.trim() ||
    DEFAULT_WORKSPACE_ID
  );
}

function getPowerBiExecuteQueriesEndpoint(
  target?: PowerBiDatasetTarget,
): string {
  const datasetId = getPowerBiDatasetId(target);
  const workspaceId = getPowerBiWorkspaceId(target);
  const datasetPath = `datasets/${datasetId}/executeQueries`;

  if (workspaceId) {
    return `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/${datasetPath}`;
  }

  return `https://api.powerbi.com/v1.0/myorg/${datasetPath}`;
}

function getPowerBiDatasetsEndpoint(workspaceId: string): string {
  return `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets`;
}

function getPowerBiGroupsEndpoint(): string {
  return "https://api.powerbi.com/v1.0/myorg/groups";
}

function getPowerBi404Hint(target?: PowerBiDatasetTarget): string {
  const datasetId = getPowerBiDatasetId(target);
  const workspaceId = getPowerBiWorkspaceId(target);

  if (workspaceId) {
    return `Dataset ${datasetId} was not found in workspace ${workspaceId}, or the token cannot access it. Check the dataset ID, workspace access, and dataset Build permission.`;
  }

  return "No POWERBI_GROUP_ID / POWERBI_WORKSPACE_ID is configured, so the request is using My workspace. If the dataset is in a workspace, set the workspace ID and make sure the token has workspace access and dataset Build permission.";
}

function getPowerBiErrorMessage(
  data: PowerBiErrorResponse,
  status: number,
  target?: PowerBiDatasetTarget,
  operation = "Power BI executeQueries",
): string {
  if ("error" in data && data.error) {
    const code =
      data.error.code || data.error["pbi.error"]?.code || `HTTP ${status}`;
    const detail =
      data.error.message ||
      ("message" in data && data.message ? data.message : "");

    const base = detail
      ? `${operation} failed (${code}): ${detail}`
      : `${operation} failed (${code}, HTTP ${status})`;

    if (status === 404 && code === "PowerBIFolderNotFound") {
      return `${base}. Workspace ${target?.workspaceId || getDefaultPowerBiWorkspaceId()} was not found, or this token cannot access it. Check that the app/service principal is added to the workspace.`;
    }

    return status === 404 ? `${base}. ${getPowerBi404Hint(target)}` : base;
  }

  if ("message" in data && data.message) {
    return `${operation} failed (HTTP ${status}): ${data.message}`;
  }

  if (status === 404) {
    return `${operation} failed (404). ${getPowerBi404Hint(target)}`;
  }

  return `${operation} failed (HTTP ${status})`;
}

async function getClientCredentialsToken(
  tenantId: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
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
    throw new PowerBiRequestError(
      data.error_description ||
        data.error ||
        "Failed to get Power BI access token",
      500,
    );
  }

  return data.access_token;
}

export async function getPowerBiToken(): Promise<string> {
  // Temporary local override until the app/service principal has workspace access.
  const staticToken = process.env.POWERBI_ACCESS_TOKEN?.trim();
  if (staticToken) return staticToken;

  const tenantId = process.env.POWERBI_TENANT_ID?.trim();
  const clientId = process.env.POWERBI_CLIENT_ID?.trim();
  const clientSecret = process.env.POWERBI_CLIENT_SECRET?.trim();

  if (tenantId && clientId && clientSecret) {
    return getClientCredentialsToken(tenantId, clientId, clientSecret);
  }

  throw new PowerBiRequestError(
    "Missing Power BI configuration. Set POWERBI_TENANT_ID, POWERBI_CLIENT_ID and POWERBI_CLIENT_SECRET.",
    500,
  );
}

export async function executePowerBiQuery(
  query: string,
  target?: PowerBiDatasetTarget,
): Promise<PowerBiExecuteQueriesResponse> {
  const accessToken = await getPowerBiToken();
  const endpoint = getPowerBiExecuteQueriesEndpoint(target);

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queries: [{ query }],
        serializerSettings: { includeNulls: true },
      }),
      cache: "no-store",
    });
  } catch (err) {
    throw new PowerBiRequestError(
      err instanceof Error ? err.message : "Power BI request failed",
      502,
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as
    | PowerBiExecuteQueriesResponse
    | PowerBiErrorResponse;

  if (!upstream.ok) {
    throw new PowerBiRequestError(
      getPowerBiErrorMessage(
        data as PowerBiErrorResponse,
        upstream.status,
        target,
      ),
      upstream.status,
    );
  }

  return data as PowerBiExecuteQueriesResponse;
}

export async function getPowerBiDatasets(
  target?: Pick<PowerBiDatasetTarget, "workspaceId">,
): Promise<PowerBiDataset[]> {
  const workspaceId =
    target?.workspaceId?.trim() || getDefaultPowerBiWorkspaceId();
  const accessToken = await getPowerBiToken();

  let upstream: Response;
  try {
    upstream = await fetch(getPowerBiDatasetsEndpoint(workspaceId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
  } catch (err) {
    throw new PowerBiRequestError(
      err instanceof Error ? err.message : "Power BI datasets request failed",
      502,
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as
    | PowerBiDatasetsResponse
    | PowerBiErrorResponse;

  if (!upstream.ok) {
    throw new PowerBiRequestError(
      getPowerBiErrorMessage(
        data as PowerBiErrorResponse,
        upstream.status,
        {
          workspaceId,
        },
        "Power BI datasets request",
      ),
      upstream.status,
    );
  }

  return "value" in data && Array.isArray(data.value) ? data.value : [];
}

export async function getPowerBiGroups(): Promise<PowerBiGroup[]> {
  const accessToken = await getPowerBiToken();

  let upstream: Response;
  try {
    upstream = await fetch(getPowerBiGroupsEndpoint(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
  } catch (err) {
    throw new PowerBiRequestError(
      err instanceof Error ? err.message : "Power BI groups request failed",
      502,
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as
    | PowerBiGroupsResponse
    | PowerBiErrorResponse;

  if (!upstream.ok) {
    throw new PowerBiRequestError(
      getPowerBiErrorMessage(
        data as PowerBiErrorResponse,
        upstream.status,
        undefined,
        "Power BI groups request",
      ),
      upstream.status,
    );
  }

  return "value" in data && Array.isArray(data.value) ? data.value : [];
}
