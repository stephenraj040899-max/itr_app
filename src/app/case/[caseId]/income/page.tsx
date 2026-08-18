import { WorkflowPage } from "@/components/workflow/page-shell";
import { IncomeForm } from "@/components/income-form";

export default function IncomePage(){return <WorkflowPage step={2} eyebrow="Step 2 · Income" title="Tell us about your income" description="Upload salary evidence and confirm the key figures. Files stay on this device until you submit them to the secure document service."><IncomeForm/></WorkflowPage>}
