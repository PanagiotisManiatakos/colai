import Link from "next/link";

import type { ReportTile } from "@/lib/bi-reports/biReports";

const reportTiles: ReportTile[] = [
  {
    key: "sales-per-month",
    title: "Πωλήσεις ανά μήνα",
    subtitle: "Sales measure ανά Calendar month",
    icon: "bi-bar-chart-line",
    accent: "#2563eb",
    href: "/bi-reports/sales-per-month",
  },
  {
    key: "sales-per-year",
    title: "Πωλήσεις ανά έτος",
    subtitle: "Coloplast, OC PER και προϊόντα",
    icon: "bi-graph-up-arrow",
    accent: "#7c3aed",
    href: "/bi-reports/sales-per-year",
  },
  {
    key: "akrateia",
    title: "Ακράτεια",
    subtitle: "CC sales, PER και εκτελέσεις",
    icon: "bi-droplet-half",
    accent: "#dc2626",
    href: "/bi-reports/akrateia",
  },
];

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
              <span className="d-flex align-items-center justify-content-between gap-2">
                <span className="fw-semibold text-truncate">
                  {report.title}
                </span>
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

export default function BiReportsPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <section className="app-card p-3">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h1 className="h4 fw-bold mb-0">BI Reports</h1>
              <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis">
                Power BI
              </span>
            </div>
            <div className="text-secondary mt-1" style={{ fontSize: 13 }}>
              Επιλογή αναφοράς πωλήσεων
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

      <ReportSelector reports={reportTiles} />
    </div>
  );
}
