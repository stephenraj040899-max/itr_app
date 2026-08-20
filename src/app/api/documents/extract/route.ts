import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api/errors";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { extractTaxDocument } from "@/lib/documents/gemini";
import { extractionRequestTypes } from "@/lib/documents/extraction";
import { serverEnv } from "@/lib/env";
import { rateLimit, requestId, requireSameOrigin } from "@/lib/api/request";

const requestedTypeSchema = z.enum(extractionRequestTypes);
export async function POST(request: NextRequest) {
  const id = requestId(request);
  try {
    requireSameOrigin(request);
    if (serverEnv().APP_ENV !== "local") await requireAuthenticatedUser(request);
    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    rateLimit(`document-extraction:${clientKey}`, 8, 60_000);
    const form = await request.formData();
    if (form.get("processingConsent") !== "true") throw Object.assign(new Error("Document processing consent is required"), { status: 400 });
    const file = form.get("file");
    if (!(file instanceof File)) throw Object.assign(new Error("A document file is required"), { status: 400 });
    const extraction = await extractTaxDocument(file, requestedTypeSchema.parse(form.get("requestedType")));
    return NextResponse.json({ extraction, reviewRequired: true, requestId: id });
  } catch (error) { return apiError(error, id); }
}
