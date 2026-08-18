"use client";

import Link from "next/link";
import { Calculator, Info } from "lucide-react";
import { FileDropzone } from "@/components/documents/file-dropzone";

export function IncomeForm() {
  return <form onSubmit={(event) => event.preventDefault()}>
    <section className="section-block">
      <div className="section-heading"><div><span className="section-number">1</span><div><h2>Salary evidence</h2><p className="fine">Upload one Form 16 or one or more monthly salary slips.</p></div></div><span className="optional-tag">PDF preferred</span></div>
      <FileDropzone title="Drop Form 16 or salary slips here" description="PDF, JPG, PNG or WEBP · maximum 10 MB per file" />
    </section>
    <section className="section-block">
      <div className="section-heading"><div><span className="section-number">2</span><div><h2>Salary details</h2><p className="fine">These figures help us cross-check the document extraction.</p></div></div></div>
      <div className="form-grid compact-grid">
        <div className="field"><label htmlFor="employer">Employer name</label><input className="input" id="employer" name="employer" autoComplete="organization" placeholder="Example Technologies Pvt Ltd" /></div>
        <div className="field"><label htmlFor="employee-id">Employee ID <span className="optional">Optional</span></label><input className="input" id="employee-id" name="employeeId" /></div>
        <div className="field"><label htmlFor="gross-salary">Annual gross salary</label><div className="money-input"><span>₹</span><input id="gross-salary" name="grossSalary" inputMode="numeric" placeholder="12,40,000" /></div></div>
        <div className="field"><label htmlFor="tds">TDS deducted</label><div className="money-input"><span>₹</span><input id="tds" name="tds" inputMode="numeric" placeholder="1,20,000" /></div></div>
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
    <div className="actions"><Link className="button secondary" href="/start">Back</Link><Link className="button primary" href="/case/demo/deductions"><Calculator size={17} />Save & continue</Link></div>
  </form>;
}
