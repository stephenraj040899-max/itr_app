"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Info, ScanSearch, Sparkles } from "lucide-react";
import { FileDropzone } from "@/components/documents/file-dropzone";
import { requestDocumentExtraction } from "@/lib/documents/client";
import { taxPeriodFromMonth } from "@/lib/tax/period";

export function IncomeForm() {
  const router = useRouter();
  const [salaryFiles, setSalaryFiles] = useState<File[]>([]);
  const [employer, setEmployer] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [grossSalary, setGrossSalary] = useState("");
  const [tds, setTds] = useState("");
  const [aiState, setAiState] = useState({ busy: false, message: "", warnings: [] as string[] });
  const [detectedPeriod, setDetectedPeriod] = useState("");
  const [saveState, setSaveState] = useState({ busy: false, error: "" });

  async function extractSalary(file = salaryFiles[0]) {
    if (!file) return;
    setAiState({ busy: true, message: "Reading the document securely…", warnings: [] });
    try {
      const result = await requestDocumentExtraction(file, "SALARY_EVIDENCE");
      if (result.income.employerName) setEmployer(result.income.employerName);
      if (result.income.employeeId) setEmployeeId(result.income.employeeId);
      if (result.income.annualGrossSalary !== null || result.income.grossEarningsForPeriod !== null) setGrossSalary((result.income.annualGrossSalary ?? result.income.grossEarningsForPeriod ?? 0).toLocaleString("en-IN"));
      if (result.income.annualTds !== null || result.income.tdsForPeriod !== null) setTds((result.income.annualTds ?? result.income.tdsForPeriod ?? 0).toLocaleString("en-IN"));
      const period = result.income.payPeriod ? ` · ${result.income.payPeriod}` : "";
      if (result.income.payPeriod) {
        try { setDetectedPeriod(taxPeriodFromMonth(result.income.payPeriod).label); } catch { setDetectedPeriod(""); }
      }
      setAiState({ busy: false, message: `${result.detectedDocumentType.replaceAll("_", " ")} extracted with ${Math.round(result.confidence * 100)}% model confidence${period}. Confirm every value below.`, warnings: result.warnings });
    } catch (error) {
      setAiState({ busy: false, message: error instanceof Error ? error.message : "Extraction failed", warnings: [] });
    }
  }

  async function saveIncome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState({ busy: true, error: "" });
    try {
      const token = localStorage.getItem("taxright.firebase.idToken");
      if (token) {
        const values = new FormData(event.currentTarget);
        const response = await fetch("/api/cases/demo/income", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ employer: values.get("employer"), employeeId: values.get("employeeId"), grossSalary: values.get("grossSalary"), tds: values.get("tds"), interestIncome: values.get("interestIncome"), rentalIncome: values.get("rentalIncome"), salaryEvidenceCount: salaryFiles.length }) });
        if (!response.ok) {
          const body = await response.json() as { error?: { message?: string } };
          throw new Error(body.error?.message ?? "Income could not be saved. Please try again.");
        }
      }
      router.push("/case/demo/deductions");
    } catch (error) {
      setSaveState({ busy: false, error: error instanceof Error ? error.message : "Income could not be saved. Please try again." });
    }
  }

  return <form onSubmit={saveIncome}>
    <section className="section-block">
      <div className="section-heading"><div><span className="section-number">1</span><div><h2>Salary evidence</h2><p className="fine">Upload one Form 16 or one or more monthly salary slips.</p></div></div><span className="optional-tag">PDF preferred</span></div>
      <FileDropzone title="Drop Form 16 or salary slips here" description="PDF, JPG, PNG or WEBP · maximum 10 MB per file" onFilesChange={(files) => { setSalaryFiles(files); if (files[0]) void extractSalary(files[0]); }} />
      <div className="ai-extract-row"><button className="button ai-button" type="button" disabled={!salaryFiles.length || aiState.busy} onClick={() => void extractSalary()}><ScanSearch size={17}/>{aiState.busy ? "Extracting…" : "Extract details with Gemini 3.5 Flash"}</button><span className="fine"><Sparkles size={13}/> AI suggestions require confirmation</span></div>
      {aiState.message ? <div className="extraction-result" role="status"><strong>{aiState.message}</strong>{aiState.message.includes("sign in") ? <Link href="/sign-in">Sign in to continue</Link> : null}{detectedPeriod ? <span>Detected tax period: <b>{detectedPeriod}</b>. This document will be reviewed against that period.</span> : null}{aiState.warnings.map((warning) => <span key={warning}>{warning}</span>)}</div> : null}
    </section>
    <section className="section-block">
      <div className="section-heading"><div><span className="section-number">2</span><div><h2>Salary details</h2><p className="fine">These figures help us cross-check the document extraction.</p></div></div></div>
      <div className="form-grid compact-grid">
        <div className="field"><label htmlFor="employer">Employer name</label><input className="input" id="employer" name="employer" autoComplete="organization" placeholder="Example Technologies Pvt Ltd" value={employer} onChange={(event) => setEmployer(event.target.value)} /></div>
        <div className="field"><label htmlFor="employee-id">Employee ID <span className="optional">Optional</span></label><input className="input" id="employee-id" name="employeeId" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} /></div>
        <div className="field"><label htmlFor="gross-salary">Annual gross salary</label><div className="money-input"><span>₹</span><input id="gross-salary" name="grossSalary" inputMode="numeric" placeholder="12,40,000" value={grossSalary} onChange={(event) => setGrossSalary(event.target.value)} /></div></div>
        <div className="field"><label htmlFor="tds">TDS deducted</label><div className="money-input"><span>₹</span><input id="tds" name="tds" inputMode="numeric" placeholder="1,20,000" value={tds} onChange={(event) => setTds(event.target.value)} /></div></div>
      </div>
      <div className="callout subtle"><Info size={17} aria-hidden="true" /><span>Do not include reimbursements twice. We’ll reconcile your entries with Form 16 and salary slips before review.</span></div>
    </section>
    <section className="section-block">
      <div className="section-heading"><div><span className="section-number">3</span><div><h2>Other income</h2><p className="fine">Add an estimate now; supporting evidence can be attached next.</p></div></div><span className="optional-tag">Optional</span></div>
      <div className="form-grid compact-grid">
        <div className="field"><label htmlFor="interest-income">Savings and deposit interest</label><div className="money-input"><span>₹</span><input id="interest-income" name="interestIncome" inputMode="numeric" placeholder="0" /></div></div>
        <div className="field"><label htmlFor="rental-income">Rental income</label><div className="money-input"><span>₹</span><input id="rental-income" name="rentalIncome" inputMode="numeric" placeholder="0" /></div></div>
      </div>
    </section>
    {saveState.error ? <p className="form-error" role="alert">{saveState.error}</p> : null}
    <div className="actions"><Link className="button secondary" href="/start">Back</Link><button className="button primary" type="submit" disabled={saveState.busy}><Calculator size={17} />{saveState.busy ? "Saving…" : "Save & continue"}</button></div>
  </form>;
}
