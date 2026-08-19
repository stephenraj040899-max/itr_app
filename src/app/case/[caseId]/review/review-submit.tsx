"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {submitCaseForReview} from "@/lib/documents/client";
export function ReviewSubmit({caseId}:{caseId:string}){const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");async function submit(){setBusy(true);setError("");try{await submitCaseForReview(caseId);router.push(`/case/${caseId}/payment`)}catch(cause){setError(cause instanceof Error?cause.message:"We couldn’t submit your case.");setBusy(false)}}return <div style={{display:"grid",gap:8,justifyItems:"end"}}><button className="button primary" type="button" onClick={submit} disabled={busy}>{busy?"Submitting…":"Submit for Tax Review"}</button>{error?<p className="form-error" role="alert" style={{margin:0,textAlign:"right"}}>{error}{error.toLowerCase().includes("sign in")?<>{" "}<a href={`/sign-in?next=${encodeURIComponent(`/case/${caseId}/review`)}`}>Sign in</a></>:null}</p>:null}</div>}
