import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api/errors";
import { requestId, rateLimit, requireSameOrigin } from "@/lib/api/request";
import { auditLog } from "@/lib/security/logging";

const incomeSaveSchema = z.object({
  employer: z.string().trim().max(160),
  employeeId: z.string().trim().max(80),
  grossSalary: z.string().trim().max(32),
  tds: z.string().trim().max(32),
  interestIncome: z.string().trim().max(32),
  rentalIncome: z.string().trim().max(32),
  salaryEvidenceCount: z.number().int().nonnegative().max(20),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const id = requestId(request);
  try {
    requireSameOrigin(request);
    const user = await requireAuthenticatedUser(request);
    rateLimit(user.uid, 30);
    const { caseId } = await params;
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(caseId)) throw Object.assign(new Error("Invalid case identifier"), { status: 400 });
    const body = incomeSaveSchema.parse(await request.json());
    auditLog({ event_type: "INCOME_SAVED", case_id: caseId, actor_id: user.uid, status: "accepted", salary_evidence_count: body.salaryEvidenceCount });
    return NextResponse.json({ caseId, status: "SAVED" }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return apiError(error, id);
  }
}
