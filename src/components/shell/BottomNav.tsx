"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

type Item = {
  href: string;
  icon: string;
  label: string;
  badge?: number;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function BottomNav() {
  const pathname = usePathname();
  const pendingDiscounts = useAppSelector((s) =>
    s.discountRequests.requests.filter((r) => r.statusId == -1).length
  );

  const items: Item[] = [
    { href: "/", icon: "bi-house", label: "Αρχική" },
    { href: "/orders", icon: "bi-list-check", label: "Παραγγελίες" },
    // { href: "/diadikasia-wc", icon: "bi bi-calendar-check", label: "WC" },
    {
      href: "/discount-requests",
      icon: "bi-tag",
      label: "Αιτήματα",
      badge: pendingDiscounts || undefined,
    },
    { href: "/settings", icon: "bi-gear", label: "Ρυθμίσεις" },
  ];

  return (
    <nav className="app-bottom-nav">
      <div className="d-flex justify-content-around px-2">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "text-decoration-none d-flex flex-column align-items-center justify-content-center py-2 px-2 " +
                (active ? "text-primary" : "text-secondary")
              }
              aria-current={active ? "page" : undefined}
            >
              <div className="position-relative">
                <i className={`nav-icon bi ${it.icon}`} />
                {it.badge ? (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {it.badge}
                  </span>
                ) : null}
              </div>
              <div className="nav-label mt-1">{it.label}</div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
