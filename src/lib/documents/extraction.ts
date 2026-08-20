import { z } from "zod";

export const extractionRequestTypes = ["PAN_CARD", "AADHAAR_CARD", "SALARY_EVIDENCE"] as const;
export type ExtractionRequestType = (typeof extractionRequestTypes)[number];

const nullableText = z.string().trim().min(1).nullable();
const nullableAmount = z.number().int().nonnegative().nullable();

export const taxDocumentExtractionSchema = z.object({
  detectedDocumentType: z.enum(["PAN_CARD", "AADHAAR_CARD", "SALARY_SLIP", "FORM_16", "UNKNOWN"]),
  confidence: z.number().min(0).max(1),
  identity: z.object({
    fullName: nullableText,
    dateOfBirth: nullableText,
    pan: nullableText,
    aadhaarLast4: z.string().regex(/^[0-9]{4}$/).nullable(),
  }),
  income: z.object({
    employerName: nullableText,
    employeeId: nullableText,
    payPeriod: nullableText,
    grossEarningsForPeriod: nullableAmount,
    annualGrossSalary: nullableAmount,
    taxableIncome: nullableAmount,
    tdsForPeriod: nullableAmount,
    annualTds: nullableAmount,
  }),
  warnings: z.array(z.string().trim().min(1).max(240)).max(8),
});

export type TaxDocumentExtraction = z.infer<typeof taxDocumentExtractionSchema>;

export function normalizeExtractedDate(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,4})$/);
  if (!match) return null;

  const [, first, second, third] = match;
  const year = first.length === 4 ? Number(first) : Number(third);
  const month = Number(second);
  const day = first.length === 4 ? Number(third) : Number(first);
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}
