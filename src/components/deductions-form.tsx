"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, CircleAlert, Gem, GraduationCap, HeartPulse, Home, Landmark, PiggyBank, ReceiptIndianRupee, ShoppingBasket, UserRoundPlus, Wheat } from "lucide-react";
import { FileDropzone } from "@/components/documents/file-dropzone";

const deductions = [
  { id: "80c", icon: PiggyBank, title: "80C investments & savings", note: "Combined eligible limit: ₹1,50,000", fields: ["LIC / life-insurance premium", "EPF, PPF, ELSS or tax-saver deposit", "Other eligible 80C investment"] },
  { id: "80d", icon: HeartPulse, title: "Health & medical", note: "80D limits depend on age and who is insured", fields: ["Health-insurance premium", "Eligible preventive health check-up", "Eligible senior-citizen medical expense"] },
  { id: "education", icon: GraduationCap, title: "Education", note: "Tuition fees may fall under 80C; education-loan interest is separate", fields: ["Children’s eligible tuition fees", "Education-loan interest paid"] },
  { id: "housing", icon: Home, title: "Home loan, rent & housing", note: "Principal and interest are assessed under different rules", fields: ["Home-loan principal repaid", "Home-loan interest paid", "Rent paid during the year"] },
  { id: "interest", icon: Landmark, title: "Bank interest", note: "Savings interest eligibility differs under 80TTA and 80TTB", fields: ["Savings-account interest", "Fixed-deposit interest"] },
] as const;

type HouseholdMember = { id: number; relationship: string; gender: string; ageBand: string; schoolGoing: string };
const groceryCategories = [
  ["grains", "Food grains"],
  ["meals", "Meals / prepared food"],
  ["oil", "Cooking oil"],
  ["milk", "Milk and dairy"],
  ["snacks", "Snacks"],
  ["other", "Other household food"],
] as const;

export function DeductionsForm() {
  const [open, setOpen] = useState("80c");
  const [nextMemberId, setNextMemberId] = useState(1);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([{ id: 0, relationship: "self", gender: "", ageBand: "adult", schoolGoing: "no" }]);
  const [nutritionPlanning, setNutritionPlanning] = useState(false);
  const [groceryAmounts, setGroceryAmounts] = useState<Record<(typeof groceryCategories)[number][0], string>>({ grains: "", meals: "", oil: "", milk: "", snacks: "", other: "" });
  const [marketTotal, setMarketTotal] = useState("");
  const [lunchPrice, setLunchPrice] = useState("39");
  const [schoolDays, setSchoolDays] = useState("");
  const [goldContribution, setGoldContribution] = useState("5000");
  const [goldMonths, setGoldMonths] = useState("11");
  const [goldMaturity, setGoldMaturity] = useState("55000");

  function updateMember(id: number, field: keyof Omit<HouseholdMember, "id">, value: string) {
    setHouseholdMembers((members) => members.map((member) => member.id === id ? { ...member, [field]: value } : member));
  }

  function addMember() {
    setHouseholdMembers((members) => [...members, { id: nextMemberId, relationship: "child", gender: "", ageBand: "child", schoolGoing: "yes" }]);
    setNextMemberId((value) => value + 1);
  }

  function removeMember(id: number) {
    if (id === 0) return;
    setHouseholdMembers((members) => members.filter((member) => member.id !== id));
  }

  const schoolChildren = householdMembers.filter((member) => member.ageBand === "child" && member.schoolGoing === "yes").length;
  const people = householdMembers.length;
  const childLunchPrice = Number(lunchPrice.replace(/,/g, "")) || 0;
  const days = Number(schoolDays.replace(/,/g, "")) || 0;
  const groceryTotal = Object.values(groceryAmounts).reduce((total, amount) => total + (Number(amount.replace(/,/g, "")) || 0), 0);
  const marketFoodTotal = Number(marketTotal.replace(/,/g, "")) || 0;
  const monthlyLunch = childLunchPrice * days * schoolChildren;
  const monthlyPlan = groceryTotal + monthlyLunch;
  const estimatedSavings = marketFoodTotal > 0 ? Math.max(0, marketFoodTotal - groceryTotal) : 0;

  function updateGrocery(category: (typeof groceryCategories)[number][0], value: string) {
    setGroceryAmounts((amounts) => ({ ...amounts, [category]: value }));
  }
  const goldPaid = (Number(goldContribution.replace(/,/g, "")) || 0) * (Number(goldMonths.replace(/,/g, "")) || 0);
  const goldMaturityValue = Number(goldMaturity.replace(/,/g, "")) || 0;
  const goldDifference = goldMaturityValue - goldPaid;

  return <form onSubmit={(event) => event.preventDefault()}>
    <section className="section-block household-context">
      <div className="section-heading"><div><span className="section-number"><UserRoundPlus size={18}/></span><div><h2>Household context</h2><p className="fine">These details help us identify age-based health, education and family-planning questions.</p></div></div><span className="optional-tag">Optional</span></div>
      <div className="household-list">{householdMembers.map((member, index) => <div className="household-member" key={member.id}>
        <div className="household-member-heading"><strong>{index === 0 ? "Your details" : `Family member ${index}`}</strong>{member.id !== 0 ? <button className="text-button" type="button" onClick={() => removeMember(member.id)}>Remove</button> : null}</div>
        <div className="form-grid compact-grid four-column">
          <div className="field"><label htmlFor={`relationship-${member.id}`}>Relationship</label><select className="select" id={`relationship-${member.id}`} value={member.relationship} onChange={(event) => updateMember(member.id, "relationship", event.target.value)}><option value="self">Self</option><option value="spouse">Spouse / partner</option><option value="child">Child</option><option value="parent">Parent</option><option value="other">Other dependent</option></select></div>
          <div className="field"><label htmlFor={`gender-${member.id}`}>Gender</label><select className="select" id={`gender-${member.id}`} value={member.gender} onChange={(event) => updateMember(member.id, "gender", event.target.value)}><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Another identity</option></select></div>
          <div className="field"><label htmlFor={`age-band-${member.id}`}>Age category</label><select className="select" id={`age-band-${member.id}`} value={member.ageBand} onChange={(event) => updateMember(member.id, "ageBand", event.target.value)}><option value="child">Child · under 18</option><option value="adult">Adult · 18–59</option><option value="senior">Senior · 60+</option></select></div>
          <div className="field"><label htmlFor={`school-going-${member.id}`}>School-going</label><select className="select" id={`school-going-${member.id}`} value={member.schoolGoing} onChange={(event) => updateMember(member.id, "schoolGoing", event.target.value)}><option value="no">No</option><option value="yes">Yes</option><option value="na">Not applicable</option></select></div>
        </div>
      </div>)}</div>
      <button className="button secondary add-member" type="button" onClick={addMember}><UserRoundPlus size={16}/> Add family member</button>
      <div className="nutrition-planning"><label className="checkbox-row"><input type="checkbox" checked={nutritionPlanning} onChange={(event) => setNutritionPlanning(event.target.checked)}/><span><strong>Nutrition and organic food-grain planning</strong><small>Tell us if you want a household nutrition/organic grains recommendation in the next planning step. This is not treated as a tax deduction.</small></span></label>{nutritionPlanning ? <div className="recommendation-note"><Wheat size={17}/><span><strong>Next-step recommendation enabled.</strong> We’ll prepare a practical household food-grain planning suggestion based on the family profile and affordability entries.</span></div> : null}</div>
    </section>
    <section className="section-block food-planner">
      <div className="section-heading"><div><span className="section-number"><Wheat size={18}/></span><div><h2>AI-assisted household food plan</h2><p className="fine">Enter actual monthly amounts or your partner quote. The planner uses family size, age bands and school-going children without inserting a fixed ₹1,800 assumption.</p></div></div><span className="optional-tag">Planning estimate</span></div>
      <div className="form-grid three-column compact-grid">{groceryCategories.map(([category, label]) => <div className="field" key={category}><label htmlFor={`grocery-${category}`}>{label}</label><div className="money-input"><span>₹</span><input id={`grocery-${category}`} inputMode="numeric" placeholder="Enter amount" value={groceryAmounts[category]} onChange={(event) => updateGrocery(category, event.target.value)}/></div></div>)}</div>
      <div className="form-grid compact-grid three-column"><div className="field"><label htmlFor="market-food-total">Comparable market total <span className="optional">Optional</span></label><div className="money-input"><span>₹</span><input id="market-food-total" inputMode="numeric" placeholder="Enter market quote" value={marketTotal} onChange={(event) => setMarketTotal(event.target.value)}/></div></div><div className="field"><label htmlFor="child-lunch-price">Child lunch / serving</label><div className="money-input"><span>₹</span><input id="child-lunch-price" inputMode="numeric" value={lunchPrice} onChange={(event) => setLunchPrice(event.target.value)}/></div></div><div className="field"><label htmlFor="school-days">School days / month</label><input className="input" id="school-days" inputMode="numeric" placeholder="Enter days" value={schoolDays} onChange={(event) => setSchoolDays(event.target.value)}/></div></div>
      <div className="food-plan-metrics" aria-live="polite"><div><span>Household members</span><strong>{people}</strong></div><div><span>School-going children</span><strong>{schoolChildren}</strong></div><div><span>Monthly food plan</span><strong>₹{monthlyPlan.toLocaleString("en-IN")}</strong></div><div><span>Estimated saving</span><strong>{marketFoodTotal > 0 ? `₹${estimatedSavings.toLocaleString("en-IN")}` : "Add market quote"}</strong></div></div>
      <div className="callout subtle"><CircleAlert size={17}/><span>Calculation: ₹{groceryTotal.toLocaleString("en-IN")} grocery categories + ({schoolChildren} child(ren) × ₹{childLunchPrice.toLocaleString("en-IN")} × {days || 0} entered school days) = ₹{monthlyPlan.toLocaleString("en-IN")} per month. The planner does not guess prices or nutrition suitability.</span></div>
    </section>
    <section className="section-block financial-picture">
      <div className="section-heading"><div><span className="section-number">₹</span><div><h2>Your monthly financial picture</h2><p className="fine">Useful for planning and affordability; these entries are not automatically tax deductions.</p></div></div><span className="optional-tag">Optional</span></div>
      <div className="form-grid three-column compact-grid">
        <div className="field"><label htmlFor="groceries"><ShoppingBasket size={16}/> Groceries & household</label><div className="money-input"><span>₹</span><input id="groceries" inputMode="numeric" placeholder="12,000" /></div></div>
        <div className="field"><label htmlFor="monthly-savings"><PiggyBank size={16}/> General savings</label><div className="money-input"><span>₹</span><input id="monthly-savings" inputMode="numeric" placeholder="10,000" /></div></div>
        <div className="field"><label htmlFor="gold-scheme"><Gem size={16}/> Gold savings scheme</label><div className="money-input"><span>₹</span><input id="gold-scheme" inputMode="numeric" placeholder="5,000" /></div></div>
      </div>
      <div className="callout neutral"><CircleAlert size={17}/><span>Groceries and ordinary gold-saving or jewellery schemes generally do not create an income-tax deduction. We keep them separate so they never inflate your tax-benefit estimate.</span></div>
    </section>
    <section className="section-block partner-offer">
      <div className="section-heading"><div><span className="section-number"><Gem size={18}/></span><div><h2>Tanishq gold-savings partner scheme</h2><p className="fine">Track the household cash commitment and maturity value offered under your office partnership.</p></div></div><span className="optional-tag">Partner offer</span></div>
      <div className="form-grid compact-grid three-column">
        <div className="field"><label htmlFor="gold-contribution">Monthly contribution</label><div className="money-input"><span>₹</span><input id="gold-contribution" inputMode="numeric" value={goldContribution} onChange={(event) => setGoldContribution(event.target.value)}/></div></div>
        <div className="field"><label htmlFor="gold-months">Months paid</label><input className="input" id="gold-months" inputMode="numeric" value={goldMonths} onChange={(event) => setGoldMonths(event.target.value)}/></div>
        <div className="field"><label htmlFor="gold-maturity">Expected maturity / purchase value</label><div className="money-input"><span>₹</span><input id="gold-maturity" inputMode="numeric" value={goldMaturity} onChange={(event) => setGoldMaturity(event.target.value)}/></div></div>
      </div>
      <div className="food-plan-metrics partner-metrics"><div><span>Total paid</span><strong>₹{goldPaid.toLocaleString("en-IN")}</strong></div><div><span>Maturity value</span><strong>₹{goldMaturityValue.toLocaleString("en-IN")}</strong></div><div><span>Difference shown</span><strong className={goldDifference >= 0 ? "positive-text" : "negative-text"}>₹{goldDifference.toLocaleString("en-IN")}</strong></div></div>
      <div className="callout neutral"><CircleAlert size={17}/><span>This is a purchase/savings calculation, not an 80G donation. Confirm the partnership terms, GST, making charges, redemption conditions and invoice before relying on the displayed difference.</span></div>
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
