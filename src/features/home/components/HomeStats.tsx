import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import React from "react";

type MetricCardProps = {
  title: string;
  value: string;
  delta: string;
  deltaDirection: "up" | "down";
  icon: string; // bootstrap icon class suffix, e.g. "bi-box-seam"
};

function MetricCard({ title, value, delta, deltaDirection, icon }: MetricCardProps) {
  const badgeClass = deltaDirection === "up" ? "text-bg-success" : "text-bg-danger";
  const arrowIcon = deltaDirection === "up" ? "bi-arrow-up" : "bi-arrow-down";

  return (
    <div className="col-6">
      <div className="app-card p-3 h-100">
        <div className="d-flex align-items-start justify-content-between">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 bg-body-tertiary"
            style={{ width: 40, height: 40 }}
          >
            <i className={`bi ${icon}`} style={{ fontSize: "1.15rem" }} />
          </div>
          <span className={`badge ${badgeClass} app-pill`}>
            <i className={`bi ${arrowIcon} me-1`} />
            {delta}
          </span>
        </div>

        <div className="mt-3">
          <div className="small text-secondary" style={{ lineHeight: 1.1 }}>
            {title}
          </div>
          <div className="h5 fw-bold mb-0 mt-1" style={{ letterSpacing: "-0.02em" }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSparkPath(values: number[], w = 100, h = 42, pad = 6): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);

  const xStep = (w - pad * 2) / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return { x, y };
  });

  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

function SalesAnalysisCard() {
  // From the original dashboard (static sample data)
  const sales = [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235];
  const revenue = [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140];

  const salesPath = buildSparkPath(sales);
  const revenuePath = buildSparkPath(revenue);

  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="fw-semibold">Ανάλυση Πωλήσεων</div>
          <div className="small text-secondary">Στόχος κάθε μήνα και έσοδα</div>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary-subtle text-primary-emphasis app-pill">Sales</span>
          <span className="badge bg-info-subtle text-info-emphasis app-pill">Revenue</span>
        </div>
      </div>

      <div className="mt-3">
        <svg viewBox="0 0 100 42" width="100%" height="70" role="img" aria-label="Sales analysis">
          <path d={salesPath} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
          <path d={revenuePath} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-info" opacity={0.9} />
        </svg>
      </div>
    </div>
  );
}

function RadialProgress({ value }: { value: number }) {
  const size = 130;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Progress ${pct}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-body-tertiary" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        className="text-primary"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text className="text-body-tertiary fw-bold" x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 20 }}>
        {pct.toFixed(2)}%
      </text>
    </svg>
  );
}

function MonthlyTargetCard() {
  const progress = 75.55;
  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="fw-semibold">Στόχος του μήνα</div>
          <div className="small text-secondary">Επίτευξη του στόχου</div>
        </div>
        <span className="badge bg-success-subtle text-success-emphasis app-pill">+10%</span>
      </div>

      <div className="mt-3 d-flex align-items-center justify-content-center">
        <RadialProgress value={progress} />
      </div>

      <p className="text-secondary small text-center mb-3" style={{ lineHeight: 1.35 }}>
        Έχετε ολοκληρώσει το {progress.toFixed(2)}% του μηνιαίου στόχου σας.
        <br />
        Απομένουν 4 παραγγελίες για την επίτευξη του.
      </p>

      <div className="d-flex align-items-center justify-content-around text-center">
        <div>
          <div className="text-secondary small">Στόχος</div>
          <div className="fw-semibold">$20K</div>
        </div>
        <div className="app-divider" style={{ width: 1, height: 26 }} />
        <div>
          <div className="text-secondary small">Κέρδος</div>
          <div className="fw-semibold">$20K</div>
        </div>
        <div className="app-divider" style={{ width: 1, height: 26 }} />
        <div>
          <div className="text-secondary small">Σήμερα</div>
          <div className="fw-semibold">$20K</div>
        </div>
      </div>
    </div>
  );
}

export default function HomeStats() {
  return (
    <div
      className="h-100 d-flex flex-column"
      style={{
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="row g-3 mb-3">
        <MetricCard
          title="Παραγγελίες Μήνα"
          value="3,782"
          delta="11.01%"
          deltaDirection="up"
          icon="bi-box-seam"
        />
        <MetricCard
          title="Συνταγές επόμενων 10 ημερών"
          value="5,359"
          delta="9.05%"
          deltaDirection="down"
          icon="bi-paperclip"
        />
      </div>

      <div className="d-grid gap-3">
        <SalesAnalysisCard />
        <MonthlyTargetCard />
      </div>
      <FloatingActionButton href="/orders/0" ariaLabel="Νέα παραγγελία" />

    </div>
  );
}
