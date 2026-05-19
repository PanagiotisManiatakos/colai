export type AiClient = "Claude" | "Gemini";

export function getAiRunErrorMessage(
  e: { name?: string; message?: string },
  aiclient: AiClient,
  claudeFailedEarlier: boolean,
): string {
  const timedOut = e?.name === "AbortError";
  const tryLaterOrManual =
    "Δοκιμάστε ξανά αργότερα ή συμπληρώστε τα στοιχεία χειροκίνητα.";

  if (aiclient === "Gemini") {
    if (claudeFailedEarlier) {
      return timedOut
        ? `Τα αιτήματα AI με Claude και Gemini έληξαν. ${tryLaterOrManual}`
        : `Τα αιτήματα AI με Claude και Gemini δεν ολοκληρώθηκαν. ${tryLaterOrManual}`;
    }
    if (timedOut) {
      return `Το αίτημα AI με Gemini έληξε. ${tryLaterOrManual}`;
    }
    return (
      e?.message ||
      `Η εκτέλεση AI με Gemini δεν ήταν επιτυχής. ${tryLaterOrManual}`
    );
  }

  if (timedOut) {
    return "Το αίτημα AI έληξε. Επιλέξτε Gemini ή συμπληρώστε τα στοιχεία χειροκίνητα.";
  }
  return (
    e?.message ||
    "Το αίτημα AI δεν ολοκληρώθηκε. Επιλέξτε Gemini ή συμπληρώστε τα στοιχεία χειροκίνητα."
  );
}
