import Link from "next/link";
import { serverEnv } from "@/lib/env";
import { WorkflowPage } from "@/components/workflow/page-shell";
export default async function PaymentPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const paymentUrl = serverEnv().NATURE_LABS_PAYMENT_URL;
  return <WorkflowPage step={6} eyebrow="Next step · Services" title="Your case is with the tax review team" description="Your evidence has been submitted for human review. If you opted for Nature Labs services, continue to its secure payment page below."><div className="callout"><strong>Review submitted</strong><div className="fine">Case {caseId} is now queued for evidence validation. Payment is optional and does not change your tax estimate, deduction eligibility or review outcome.</div></div><section className="surface panel" style={{marginTop:20}}><div className="eyebrow">Nature Labs</div><h2 style={{marginTop:8}}>Continue to payment</h2><p className="muted">You will leave TaxRight AI and complete payment on Nature Labs’ approved checkout. We do not store card details here.</p>{paymentUrl?<a className="button primary" href={paymentUrl} rel="noopener noreferrer">Continue to Nature Labs payment</a>:<div className="callout warning"><strong>Payment is not configured yet.</strong><div className="fine">Set NATURE_LABS_PAYMENT_URL in the production secret configuration before enabling this handoff.</div></div>}</section><div className="actions"><Link className="button secondary" href="/dashboard">Back to case dashboard</Link></div></WorkflowPage>;
}
