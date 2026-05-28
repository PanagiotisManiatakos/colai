export type SynaineseisResults = {
  form_score?: number;
};

export function getConsentFormScore(
  results: SynaineseisResults | null | undefined,
): number | null {
  if (!results) return null;

  const formScore = Number(results.form_score);
  if (Number.isNaN(formScore)) return null;

  return formScore;
}

export function isConsentScoreTooLow(
  results: SynaineseisResults | null | undefined,
): boolean {
  const formScore = getConsentFormScore(results);
  if (formScore == null) return false;

  return formScore < 50;
}

export function isConsentScoreWarning(
  results: SynaineseisResults | null | undefined,
): boolean {
  const formScore = getConsentFormScore(results);
  if (formScore == null) return false;

  return formScore >= 50 && formScore < 70;
}

export function isConsentScoreHigh(
  results: SynaineseisResults | null | undefined,
): boolean {
  const formScore = getConsentFormScore(results);
  if (formScore == null) return false;

  return formScore >= 80;
}

export function getConsentFileCategory(file: {
  documentCategory?: string;
  document_category?: string;
}): string {
  return String(file.documentCategory ?? file.document_category ?? "");
}
