"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight, LockKeyhole, ScanSearch } from "lucide-react";
import { FileDropzone } from "@/components/documents/file-dropzone";
import { requestDocumentExtraction } from "@/lib/documents/client";
import { taxPeriodFromCurrentDate } from "@/lib/tax/period";

function displayDate(value: string | null) {
  if (!value) return "Not detected";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}-${month}-${year}` : value;
}

export function ProfileForm() {
  const [consent, setConsent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pan, setPan] = useState("");
  const [panFiles, setPanFiles] = useState<File[]>([]);
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [extractedPan, setExtractedPan] = useState<{
    fullName: string | null;
    dateOfBirth: string | null;
    pan: string | null;
  } | null>(null);
  const [identityStatus, setIdentityStatus] = useState("");
  const [busy, setBusy] = useState<"PAN" | "AADHAAR" | "">("");

  const handlePanFilesChange = useCallback((files: File[]) => {
    setPanFiles(files);
    setExtractedPan(null);
  }, []);

  async function extractIdentity(kind: "PAN" | "AADHAAR") {
    const file = kind === "PAN" ? panFiles[0] : aadhaarFiles[0];
    if (!file || !consent) return;
    setBusy(kind);
    if (kind === "PAN") setExtractedPan(null);
    setIdentityStatus("Reading identity evidence securely…");
    try {
      const result = await requestDocumentExtraction(file, kind === "PAN" ? "PAN_CARD" : "AADHAAR_CARD");
      if (result.identity.fullName) setFullName(result.identity.fullName);
      if (result.identity.dateOfBirth) setDateOfBirth(result.identity.dateOfBirth);
      if (result.identity.pan) setPan(result.identity.pan);
      if (kind === "PAN") {
        setExtractedPan({
          fullName: result.identity.fullName,
          dateOfBirth: result.identity.dateOfBirth,
          pan: result.identity.pan,
        });
      }
      const hasPanDetails = Boolean(result.identity.fullName || result.identity.dateOfBirth || result.identity.pan);
      setIdentityStatus(kind === "AADHAAR" && result.identity.aadhaarLast4
        ? `Aadhaar ending •••• ${result.identity.aadhaarLast4} read. The full number was not retained.`
        : kind === "PAN" && !hasPanDetails
          ? "The PAN card was read, but no identity details could be detected. Try a clearer scan."
          : `${kind} details extracted. Check the populated fields before continuing.`);
    } catch (error) {
      setIdentityStatus(error instanceof Error ? error.message : "Identity extraction failed");
    } finally {
      setBusy("");
    }
  }

  const identityEvidence = <section className="identity-evidence" aria-labelledby="identity-heading">
    <label className="checkbox-row identity-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required/><span>I consent to TaxRight AI processing the personal, financial and tax documents I provide for tax assessment, deduction analysis, document preparation and human review. I confirm that the information and documents submitted by me are genuine and accurate to the best of my knowledge.</span></label>
    <div className="section-heading"><div><span className="section-number">ID</span><div><h2 id="identity-heading">Identity evidence</h2><p className="fine">Upload first · details will be populated below</p></div></div><span className="optional-tag">Protected document</span></div>
    <div className="identity-grid">
      <div><FileDropzone compact multiple={false} title="PAN card" description="Upload the front as PDF or image" onFilesChange={handlePanFilesChange}/><button className="button secondary extract-small" type="button" disabled={!consent || !panFiles.length || Boolean(busy)} onClick={() => extractIdentity("PAN")}><ScanSearch size={16}/>{busy === "PAN" ? "Reading…" : "Extract PAN details"}</button></div>
      <div><FileDropzone compact multiple={false} title="Aadhaar card" description="Use a masked Aadhaar copy whenever accepted" onFilesChange={setAadhaarFiles}/><button className="button secondary extract-small" type="button" disabled={!consent || !aadhaarFiles.length || Boolean(busy)} onClick={() => extractIdentity("AADHAAR")}><ScanSearch size={16}/>{busy === "AADHAAR" ? "Reading…" : "Verify masked Aadhaar"}</button></div>
    </div>
    {identityStatus ? <div className="extraction-result" role="status"><strong>{identityStatus}</strong>{identityStatus.toLowerCase().includes("sign in") ? <Link href="/sign-in">Sign in to continue</Link> : null}</div> : null}
    {extractedPan ? <section className="pan-extracted-details" aria-labelledby="pan-details-heading" aria-live="polite"><div><span className="result-kicker">PAN extraction result</span><h3 id="pan-details-heading">Details from your uploaded PAN card</h3></div><dl><div><dt>Full name</dt><dd>{extractedPan.fullName ?? "Not detected"}</dd></div><div><dt>Date of birth</dt><dd>{displayDate(extractedPan.dateOfBirth)}</dd></div><div><dt>PAN</dt><dd>{extractedPan.pan ?? "Not detected"}</dd></div></dl><p className="fine">These values will populate the personal details fields below. Check them against the uploaded PAN card before continuing.</p></section> : null}
    <p className="fine privacy-note">TaxRight only extracts Aadhaar’s last four digits for matching. Avoid uploading an unmasked Aadhaar unless specifically required. PAN and Aadhaar values are never used in file names or public URLs.</p>
  </section>;

  return <form onSubmit={(event) => event.preventDefault()}>
    {identityEvidence}
    <div className="form-grid">
      <div className="field"><label htmlFor="name">Full name</label><input className="input" id="name" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} /><span className="fine">Enter the name exactly as shown on your PAN.</span></div>
      <div className="field"><label htmlFor="dob">Date of birth</label><input className="input" id="dob" type="date" max={new Date().toISOString().slice(0,10)} required value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} /></div>
      <div className="field"><label htmlFor="pan">PAN</label><input className="input" id="pan" inputMode="text" autoCapitalize="characters" maxLength={10} pattern="[A-Z]{5}[0-9]{4}[A-Z]" aria-describedby="pan-help" required value={pan} onChange={(event) => setPan(event.target.value.toUpperCase())} /><span className="fine" id="pan-help">Stored only through protected server processing; masked after entry.</span></div>
      <div className="field"><label htmlFor="tax-period">Tax period</label><select className="select" id="tax-period" defaultValue={taxPeriodFromCurrentDate().key}><option value={taxPeriodFromCurrentDate().key}>{taxPeriodFromCurrentDate().label}</option><option value="AY2026-27">AY 2026–27 · historical FY 2025–26 filing</option></select><span className="fine">The period defaults from today and can be changed for a historical filing.</span></div>
      <div className="field"><label htmlFor="email">Email address</label><input className="input" id="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="mobile">Mobile number</label><input className="input" id="mobile" type="tel" inputMode="numeric" autoComplete="tel" pattern="[6-9][0-9]{9}" placeholder="10-digit Indian mobile" required /></div>
      <div className="field full"><div className="callout"><div className="callout-title"><LockKeyhole size={17}/>Your information stays private</div><p className="fine">We use your documents only for tax assessment, evidence analysis and human review under the notices you accept.</p><div className="link-row"><Link href="/legal/privacy">Privacy Notice</Link><Link href="/legal/terms">Terms of Service</Link><Link href="/legal/processing">Data Processing Notice</Link></div></div></div>
    </div>
    <div className="actions"><Link className={`button primary ${!consent ? "disabled" : ""}`} aria-disabled={!consent} tabIndex={consent ? 0 : -1} href={consent ? "/case/demo/income" : "#"}>Continue <ArrowRight size={17}/></Link></div>
  </form>;
}
