"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { FileDropzone } from "@/components/documents/file-dropzone";

export function ProfileForm(){
 const [consent,setConsent]=useState(false);
 return <form onSubmit={(e)=>e.preventDefault()}><div className="form-grid">
  <div className="field"><label htmlFor="name">Full name</label><input className="input" id="name" autoComplete="name" required/><span className="fine">Enter the name exactly as shown on your PAN.</span></div>
  <div className="field"><label htmlFor="dob">Date of birth</label><input className="input" id="dob" type="date" max={new Date().toISOString().slice(0,10)} required/></div>
  <div className="field"><label htmlFor="pan">PAN</label><input className="input" id="pan" inputMode="text" autoCapitalize="characters" maxLength={10} pattern="[A-Z]{5}[0-9]{4}[A-Z]" aria-describedby="pan-help" required/><span className="fine" id="pan-help">Stored only through protected server processing; masked after entry.</span></div>
  <div className="field"><label htmlFor="ay">Assessment year</label><select className="select" id="ay" defaultValue="AY2026-27"><option>AY2026-27</option></select></div>
  <div className="field"><label htmlFor="email">Email address</label><input className="input" id="email" type="email" autoComplete="email" required/></div>
  <div className="field"><label htmlFor="mobile">Mobile number</label><input className="input" id="mobile" type="tel" inputMode="numeric" autoComplete="tel" pattern="[6-9][0-9]{9}" placeholder="10-digit Indian mobile" required/></div>
  <div className="field full"><div className="callout"><div style={{display:"flex",gap:10,alignItems:"center",fontWeight:750}}><LockKeyhole size={17}/>Your information stays private</div><p className="fine">We use your documents only for tax assessment, evidence analysis and human review under the notices you accept.</p><div style={{display:"flex",gap:14,flexWrap:"wrap"}}><Link href="/legal/privacy">Privacy Notice</Link><Link href="/legal/terms">Terms of Service</Link><Link href="/legal/processing">Data Processing Notice</Link></div></div></div>
  <div className="field full"><label className="checkbox-row"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/><span>I consent to TaxRight AI processing the personal, financial and tax documents I provide for tax assessment, deduction analysis, document preparation and human review. I confirm that the information and documents submitted by me are genuine and accurate to the best of my knowledge.</span></label></div>
 </div>
 <section className="identity-evidence" aria-labelledby="identity-heading">
  <div className="section-heading"><div><span className="section-number">ID</span><div><h2 id="identity-heading">Identity evidence</h2><p className="fine">Optional now · required before filing</p></div></div><span className="optional-tag">Protected document</span></div>
  <div className="identity-grid"><FileDropzone compact title="PAN card" description="Upload the front as PDF or image"/><FileDropzone compact title="Aadhaar card" description="Use a masked Aadhaar copy whenever accepted"/></div>
  <p className="fine privacy-note">Avoid uploading an unmasked Aadhaar unless it is specifically required. TaxRight never uses Aadhaar or PAN values in file names or public URLs.</p>
 </section><div className="actions"><Link className={`button primary ${!consent?"disabled":""}`} aria-disabled={!consent} tabIndex={consent?0:-1} href={consent?"/case/demo/income":"#"}>Continue <ArrowRight size={17}/></Link></div></form>
}
