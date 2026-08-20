"use client";

import { useState } from "react";

type Nomination = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  pincode?: string;
  area?: string;
  investmentReady?: string;
  status?: string;
  createdAt?: string;
};

export default function FranchiseAdmin() {
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<Nomination[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/franchise/nominations", { headers: { "x-admin-key": key } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not load nominations");
      setRows(body.nominations || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load nominations");
    } finally {
      setLoading(false);
    }
  }

  return <main className="page">
    <div className="eyebrow">Nature Labs · Arista admin</div>
    <h1>Franchise nominations</h1>
    <p className="lead">Review territory nominations submitted through the Arista form.</p>
    <form className="surface panel" onSubmit={load} style={{ maxWidth: 620 }}>
      <label className="field"><span>Admin dashboard key</span><input className="input" type="password" value={key} onChange={(e) => setKey(e.target.value)} required /></label>
      <button className="button primary" disabled={loading}>{loading ? "Loading…" : "View nominations"}</button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
    {rows.length ? <section className="surface panel"><div className="table-wrap"><table><thead><tr>{["Reference", "Name", "Phone", "Email", "City", "Pincode", "Area", "Readiness", "Status", "Submitted"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.name || "—"}</td><td>{row.phone || "—"}</td><td>{row.email || "—"}</td><td>{row.city || "—"}</td><td>{row.pincode || "—"}</td><td>{row.area || "—"}</td><td>{row.investmentReady || "—"}</td><td>{row.status || "—"}</td><td>{row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : "—"}</td></tr>)}</tbody></table></div></section> : null}
  </main>;
}
