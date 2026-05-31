export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function hasAnyValue(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => v !== null && v !== "");
}

export function focusWizardField(fieldName: string) {
  window.setTimeout(() => {
    const esc = (window as unknown as { CSS?: { escape?: (s: string) => string } })
      .CSS?.escape
      ? (window as unknown as { CSS: { escape: (s: string) => string } }).CSS.escape(
          fieldName,
        )
      : fieldName;
    const el = document.querySelector(`[name="${esc}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    (el as HTMLElement & { focus?: () => void })?.focus?.();
  }, 60);
}
