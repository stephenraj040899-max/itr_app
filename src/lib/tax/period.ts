export type TaxPeriod = { kind: "AY" | "TY"; label: string; key: string; financialYear: string; assessmentYear: string | null; startsOn: string; endsOn: string };
const MONTHS: Record<string, number> = { JANUARY:1, FEBRUARY:2, MARCH:3, APRIL:4, MAY:5, JUNE:6, JULY:7, AUGUST:8, SEPTEMBER:9, OCTOBER:10, NOVEMBER:11, DECEMBER:12 };
export function parseSalaryMonth(value: string): Date | null {
  const match = /^\s*([A-Za-z]+)[\s\-/]+(20\d{2})\s*$/.exec(value);
  if (!match) return null;
  const name = Object.keys(MONTHS).find((month) => month.startsWith(match[1].toUpperCase().slice(0, 3)));
  return name ? new Date(Date.UTC(Number(match[2]), MONTHS[name] - 1, 1)) : null;
}
export function taxPeriodFromMonth(month: string | Date): TaxPeriod {
  const date = month instanceof Date ? month : parseSalaryMonth(month);
  if (!date || Number.isNaN(date.getTime())) throw new Error("A valid salary month is required.");
  const year = date.getUTCFullYear();
  const fyStart = date.getUTCMonth() >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;
  const financialYear = `${fyStart}-${String(fyEnd).slice(-2)}`;
  if (fyStart >= 2026) return { kind: "TY", label: `Tax Year ${financialYear}`, key: `TY${financialYear}`, financialYear, assessmentYear: null, startsOn: `${fyStart}-04-01`, endsOn: `${fyEnd}-03-31` };
  const assessmentYear = `AY${fyEnd}-${String(fyEnd + 1).slice(-2)}`;
  return { kind: "AY", label: `AY ${fyEnd}–${String(fyEnd + 1).slice(-2)}`, key: assessmentYear, financialYear, assessmentYear, startsOn: `${fyStart}-04-01`, endsOn: `${fyEnd}-03-31` };
}
export function taxPeriodFromCurrentDate(now = new Date()): TaxPeriod { return taxPeriodFromMonth(now); }
