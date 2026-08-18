import { WorkflowPage } from "@/components/workflow/page-shell";
import { DeductionsForm } from "@/components/deductions-form";

export default function DeductionsPage(){return <WorkflowPage step={3} eyebrow="Step 3 · Deductions" title="Build your deduction profile" description="Add what you paid during the year and attach evidence. We’ll separate eligible tax deductions from ordinary household spending."><DeductionsForm/></WorkflowPage>}
