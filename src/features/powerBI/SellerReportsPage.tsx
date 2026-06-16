import Link from "next/link";

import type { ReportTile } from "@/lib/bi-reports/biReports";

type SellerReportsPageProps = {
  workspaceId: string;
  datasetId: string;
  groupName?: string;
  datasetName?: string;
};

type SellerReportTile = Omit<ReportTile, "href"> & {
  slug: string;
};

const sellerReportTiles: SellerReportTile[] = [
  {
    key: "sales-per-year",
    title: "Πωλήσεις ανά έτος",
    subtitle: "Coloplast, OC PER και προϊόντα",
    icon: "bi-graph-up-arrow",
    accent: "#7c3aed",
    slug: "sales-per-year",
  },
  {
    key: "sales-per-month",
    title: "Πωλήσεις ανά μήνα",
    subtitle: "Sales measure ανά Calendar month",
    icon: "bi-bar-chart-line",
    accent: "#2563eb",
    slug: "sales-per-month",
  },
  {
    key: "akrateia",
    title: "Ακράτεια",
    subtitle: "CC sales, PER και εκτελέσεις",
    icon: "bi-droplet-half",
    accent: "#dc2626",
    slug: "akrateia",
  },
];

function buildReportHref({
  workspaceId,
  datasetId,
  slug,
  groupName,
  datasetName,
}: SellerReportsPageProps & { slug: string }) {
  const params = new URLSearchParams();
  if (groupName) params.set("groupName", groupName);
  if (datasetName) params.set("datasetName", datasetName);

  const query = params.toString();
  const path = `/powerbi/groups/${encodeURIComponent(
    workspaceId,
  )}/datasets/${encodeURIComponent(datasetId)}/seller-reports/${slug}`;

  return query ? `${path}?${query}` : path;
}

function ReportSelector({ reports }: { reports: ReportTile[] }) {
  return (
    <div className="app-card p-2">
      <div className="d-flex flex-column gap-2">
        {reports.map((report) => (
          <Link
            key={report.key}
            href={report.href}
            className="rounded-4 bg-body-tertiary d-flex align-items-center text-decoration-none gap-3 p-2 text-start"
            style={{ color: "var(--bs-body-color)" }}
          >
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{
                width: 42,
                height: 42,
                background: `${report.accent}18`,
                color: report.accent,
                border: `1px solid ${report.accent}33`,
              }}
            >
              <i className={`bi ${report.icon}`} aria-hidden />
            </span>
            <span className="min-w-0 flex-grow-1">
              <span className="fw-semibold text-truncate d-block">
                {report.title}
              </span>
              <span
                className="d-block small text-secondary text-truncate"
                style={{ lineHeight: 1.2 }}
              >
                {report.subtitle}
              </span>
            </span>
            <i
              className="bi bi-chevron-right text-secondary flex-shrink-0"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SellerReportsPage({
  workspaceId,
  datasetId,
  groupName,
  datasetName,
}: SellerReportsPageProps) {
  const reports = sellerReportTiles.map((report) => ({
    ...report,
    href: buildReportHref({
      workspaceId,
      datasetId,
      slug: report.slug,
      groupName,
      datasetName,
    }),
  }));

  const subtitle = [datasetName, groupName].filter(Boolean).join(" • ");

  return (
    <div className="d-flex flex-column gap-3">
      <section className="app-card p-3">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h1 className="h4 fw-bold mb-0">Seller Reports</h1>
              <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis">
                Power BI
              </span>
            </div>
            <div className="text-secondary mt-1" style={{ fontSize: 13 }}>
              {subtitle || "Επιλογή αναφοράς πωλητή"}
            </div>
          </div>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 bg-body-tertiary flex-shrink-0"
            style={{ width: 48, height: 48 }}
          >
            <i className="bi bi-clipboard-data" aria-hidden />
          </div>
        </div>
      </section>

      <Link
        href={`/powerbi/groups/${encodeURIComponent(workspaceId)}/datasets${
          groupName ? `?name=${encodeURIComponent(groupName)}` : ""
        }`}
        className="btn btn-sm btn-outline-secondary align-self-start"
      >
        <i className="bi bi-chevron-left me-1" aria-hidden />
        Datasets
      </Link>

      <ReportSelector reports={reports} />
    </div>
  );
}
