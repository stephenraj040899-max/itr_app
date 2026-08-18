"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, CircleAlert, Gem, GraduationCap, HeartPulse, Home, Landmark, PiggyBank, ReceiptIndianRupee, ShoppingBasket } from "lucide-react";
import { FileDropzone } from "@/components/documents/file-dropzone";

const deductions = [
  { id: "80c", icon: PiggyBank, title: "80C investments & savings", note: "Combined eligible limit: ₹1,50,000", fields: ["LIC / life-insurance premium", "EPF, PPF, ELSS or tax-saver deposit", "Other eligible 80C investment"] },
  { id: "80d", icon: HeartPulse, title: "Health & medical", note: "80D limits depend on age and who is insured", fields: ["Health-insurance premium", "Eligible preventive health check-up", "Eligible senior-citizen medical expense"] },
  { id: "education", icon: GraduationCap, title: "Education", note: "Tuition fees may fall under 80C; education-loan interest is separate", fields: ["Children’s eligible tuition fees", "Education-loan interest paid"] },
  { id: "housing", icon: Home, title: "Home loan, rent & housing", note: "Principal and interest are assessed under different rules", fields: ["Home-loan principal repaid", "Home-loan interest paid", "Rent paid during the year"] },
  { id: "interest", icon: Landmark, title: "Bank interest", note: "Savings interest eligibility differs under 80TTA and 80TTB", fields: ["Savings-account interest", "Fixed-deposit interest"] },
] as const;

export function DeductionsForm() {
  const [open, setOpen] = useState("80c");
  return <form onSubmit={(event) => event.preventDefault()}>
    <section className="section-block financial-picture">
      <div className="section-heading"><div><span className="section-number">₹</span><div><h2>Your monthly financial picture</h2><p className="fine">Useful for planning and affordability; these entries are not automatically tax deductions.</p></div></div><span className="optional-tag">Optional</span></div>
      <div className="form-grid three-column compact-grid">
        <div className="field"><label htmlFor="groceries"><ShoppingBasket size={16}/> Groceries & household</label><div className="money-input"><span>₹</span><input id="groceries" inputMode="numeric" placeholder="12,000" /></div></div>
        <div className="field"><label htmlFor="monthly-savings"><PiggyBank size={16}/> General savings</label><div className="money-input"><span>₹</span><input id="monthly-savings" inputMode="numeric" placeholder="10,000" /></div></div>
        <div className="field"><label htmlFor="gold-scheme"><Gem size={16}/> Gold savings scheme</label><div className="money-input"><span>₹</span><input id="gold-scheme" inputMode="numeric" placeholder="5,000" /></div></div>
      </div>
      <div className="callout neutral"><CircleAlert size={17}/><span>Groceries and ordinary gold-saving or jewellery schemes generally do not create an income-tax deduction. We keep them separate so they never inflate your tax-benefit estimate.</span></div>
    </section>

    <div className="deduction-heading"><div><h2>Eligible deduction evidence</h2><p className="fine">Enter annual amounts paid and attach receipts, certificates or statements.</p></div><span className="evidence-count">5 categories</span></div>
    <div className="deduction-list">{deductions.map(({ id, icon: Icon, title, note, fields }) => {
      const expanded = open === id;
      return <section className={`deduction-card ${expanded ? "expanded" : ""}`} key={id}>
        <button className="deduction-toggle" type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? "" : id)}>
          <span className="doc-badge"><Icon/></span><span><strong>{title}</strong><small>{note}</small></span><ChevronDown className="chevron"/>
        </button>
        {expanded ? <div className="deduction-content">
          <div className="form-grid compact-grid">{fields.map((field, index) => <div className="field" key={field}><label htmlFor={`${id}-${index}`}>{field}</label><div className="money-input"><span>₹</span><input id={`${id}-${index}`} inputMode="numeric" placeholder="0" /></div></div>)}</div>
          <FileDropzone compact title={`Add ${title.toLowerCase()} evidence`} description="Receipt, premium certificate, bank statement or payment proof" />
        </div> : null}
      </section>;
    })}</div>

    <section className="section-block loan-note">
      <div className="section-heading"><div><span className="section-number"><ReceiptIndianRupee/></span><div><h2>Personal-loan payments</h2><p className="fine">Tell us the loan purpose so a reviewer can determine whether any interest is relevant.</p></div></div><span className="optional-tag">Usually not deductible</span></div>
      <div className="form-grid compact-grid"><div className="field"><label htmlFor="personal-loan">Annual repayment</label><div className="money-input"><span>₹</span><input id="personal-loan" inputMode="numeric" placeholder="0" /></div></div><div className="field"><label htmlFor="loan-purpose">Loan purpose</label><select className="select" id="loan-purpose" defaultValue="personal"><option value="personal">Personal consumption</option><option value="business">Business or profession</option><option value="property">Property improvement</option><option value="education">Education</option><option value="other">Other</option></select></div></div>
    </section>
    <div className="actions"><Link className="button secondary" href="/case/demo/income">Back</Link><Link className="button primary" href="/case/demo/80g">Save & calculate deductions</Link></div>
  </form>;
}
