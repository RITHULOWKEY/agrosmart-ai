import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, Menu, Sprout, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const links = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "AI Analysis" },
    { href: "/gallery", label: "Gallery" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];
  return <div className="min-h-screen bg-[#f8f8f2] text-[#173b2b]">
    <header className="sticky top-0 z-50 border-b border-[#173b2b]/10 bg-[#f8f8f2]/95 backdrop-blur-xl"><div className="container flex h-20 items-center justify-between gap-6"><Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#d8ecce] text-[#1e6b3d]"><Sprout className="h-5 w-5" /></span><span className="truncate font-display text-lg font-semibold">Chennai <span className="text-[#2f874d]">AgroSmart</span> AI</span></Link><nav className="hidden items-center gap-5 text-sm font-semibold text-[#567064] lg:flex">{links.map((link) => <Link key={link.href} href={link.href} className={location === link.href ? "text-[#1e6b3d]" : "hover:text-[#1e6b3d]"}>{link.label}</Link>)}</nav><div className="hidden items-center gap-3 lg:flex">{user ? <><Link href="/profile" className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#345844] hover:bg-[#e9eee5]">Profile</Link><button onClick={() => logout()} className="rounded-xl border border-[#cbdac8] px-4 py-2.5 text-sm font-bold text-[#345844]">Logout</button></> : <><Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#345844] hover:bg-[#e9eee5]">Login</Link><Link href="/register" className="rounded-xl bg-[#1d6a3b] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#15562f]">Get started <ArrowRight className="ml-1 inline h-4 w-4" /></Link></>}</div><button onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#173b2b]/10 lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>{open && <div className="border-t border-[#173b2b]/10 px-5 py-5 lg:hidden"><nav className="container flex flex-col gap-4 text-sm font-semibold">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}{user ? <><Link href="/profile" onClick={() => setOpen(false)}>Profile</Link><button className="w-fit rounded-xl border border-[#cbdac8] px-4 py-2.5" onClick={() => { setOpen(false); logout(); }}>Logout</button></> : <><Link href="/login" onClick={() => setOpen(false)}>Login</Link><Link href="/register" onClick={() => setOpen(false)} className="w-fit rounded-xl bg-[#1d6a3b] px-4 py-2.5 text-white">Get started</Link></>}</nav></div>}</header>
    {children}
    <footer className="bg-[#183e2b] py-10 text-[#d6e4d2]"><div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]"><div><p className="font-display text-lg font-semibold">Chennai AgroSmart AI</p><p className="mt-3 max-w-sm text-sm leading-6 text-[#a9c0a9]">A farmer-friendly workspace for crop photos, explainable recommendations, and useful field records.</p></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8d59e]">Explore</p><div className="mt-4 grid gap-2 text-sm text-[#c1d4bf]"><Link href="/about">About</Link><Link href="/gallery">Gallery</Link><Link href="/contact">Contact</Link></div></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8d59e]">Workspace</p><div className="mt-4 grid gap-2 text-sm text-[#c1d4bf]"><Link href="/upload">AI Analysis</Link><Link href="/history">History</Link><Link href="/profile">Profile</Link></div></div></div><div className="container mt-8 border-t border-white/10 pt-5 text-xs text-[#9cb49e]">Recommendations are advisory and should be reviewed with local agricultural guidance when crop health is uncertain.</div></footer>
  </div>;
}
