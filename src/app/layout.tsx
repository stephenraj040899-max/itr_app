import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ShieldCheck } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TaxRight AI", template: "%s | TaxRight AI" },
  description: "AI-assisted tax intelligence with human review for Indian income-tax preparation.",
  robots: { index: false, follow: false }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const staffSurface = (await headers()).get("x-taxright-surface") === "STAFF";
  return <html lang="en"><body><div className="shell">
    <header className="topbar"><div className="topbar-inner">
      <Link className="brand" href={staffSurface ? "/staff" : "/"}><span className="brand-mark"><ShieldCheck size={19}/></span><span className="brand-copy">TaxRight AI<small>{staffSurface ? "Secure staff review workspace." : "AI-assisted tax intelligence. Human reviewed."}</small></span></Link>
      <nav className="topnav" aria-label="Primary">{staffSurface ? <Link href="/staff">Review queue</Link> : <><Link href="/dashboard">My case</Link><Link href="/settings/privacy">Privacy</Link></>}</nav>
    </div></header>{children}
  </div></body></html>;
}
