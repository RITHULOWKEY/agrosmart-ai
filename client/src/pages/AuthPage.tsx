import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Eye, EyeOff, Leaf, Loader2, Sprout } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const login = trpc.auth.login.useMutation({ onSuccess: (user) => { utils.auth.me.setData(undefined, user); setLocation("/dashboard"); } });
  const register = trpc.auth.register.useMutation({ onSuccess: (user) => { utils.auth.me.setData(undefined, user); toast.success("Account created successfully."); setLocation("/dashboard"); } });
  const mutation = mode === "login" ? login : register;
  const backendMessage = mutation.error?.message ?? "";
  const friendlyBackendError = backendMessage.includes("already exists") ? "An account with this email already exists." : backendMessage.includes("incorrect") ? "Email or password is incorrect." : backendMessage.includes("Passwords do not match") ? "Passwords do not match." : backendMessage ? "We couldn't complete that request. Please try again." : "";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") await login.mutateAsync({ email: form.email, password: form.password });
      else await register.mutateAsync(form);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message.includes("already exists") ? "An account with this email already exists." : message.includes("incorrect") ? "Email or password is incorrect." : message.includes("Passwords do not match") ? "Passwords do not match." : "We couldn't complete that request. Please try again.");
    }
  };

  return <div className="min-h-screen bg-[#f6f8f1] text-[#173b2b]">
    <header className="container flex h-20 items-center justify-between gap-3"><Link href="/" className="flex min-w-0 items-center gap-3 font-display text-lg font-semibold"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#d8ecce] text-[#1e6b3d]"><Sprout className="h-5 w-5" /></span><span className="truncate">Chennai <span className="text-[#2f874d]">AgroSmart</span> AI</span></Link><Link href="/" aria-label="Back home" className="shrink-0 text-sm font-bold text-[#52705b]"><ArrowLeft className="inline h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Back home</span></Link></header>
    <main className="container grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-12 py-10 lg:grid-cols-[.95fr_1.05fr]">
      <section className="hidden rounded-[2rem] bg-[#18432e] p-10 text-white lg:block"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d7ecb4] text-[#285d38]"><Leaf className="h-6 w-6" /></span><p className="eyebrow mt-10 text-[#b8db9e]">A clearer crop decision</p><h1 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[1.02]">Your field notes, in one calm workspace.</h1><p className="mt-6 max-w-md leading-7 text-[#c7dcc8]">Save crop checks, review recommendations, and keep a photo record that belongs to you.</p><div className="mt-10 grid gap-3 text-sm text-[#d7e7d4]"><p>✓ Secure account sessions</p><p>✓ Your analysis history stays private</p><p>✓ Clear advisory recommendations</p></div></section>
      <section className="mx-auto w-full max-w-md rounded-[2rem] border border-[#d9e5d5] bg-white p-6 shadow-[0_20px_60px_rgba(37,75,49,.09)] sm:p-9"><p className="eyebrow">{mode === "login" ? "Welcome back" : "Create your workspace"}</p><h1 className="mt-3 font-display text-3xl font-semibold text-[#1d4d31]">{mode === "login" ? "Sign in to AgroSmart" : "Start with your first crop"}</h1><p className="mt-3 text-sm leading-6 text-[#718071]">{mode === "login" ? "Review previous checks or upload a new crop photo." : "Use email and password, or continue with your existing Manus account."}</p>
        <button type="button" onClick={() => startLogin()} className="mt-7 flex h-12 w-full items-center justify-center rounded-xl border border-[#bed2bc] bg-[#f7fbf5] text-sm font-bold text-[#315f3d] hover:bg-[#edf6e9]">Continue with Manus OAuth</button><div className="my-6 flex items-center gap-3 text-xs text-[#91a092]"><span className="h-px flex-1 bg-[#e2ebe0]" /> or use email <span className="h-px flex-1 bg-[#e2ebe0]" /></div>
        <form onSubmit={submit} className="grid gap-4">{mode === "register" && <label className="grid gap-2 text-sm font-bold text-[#49634f]">Full name<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 rounded-xl border border-[#cddccc] px-3 font-normal outline-none focus:border-[#4a965e] focus:ring-2 focus:ring-[#bfe0b8]" placeholder="Your name" /></label>}<label className="grid gap-2 text-sm font-bold text-[#49634f]">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl border border-[#cddccc] px-3 font-normal outline-none focus:border-[#4a965e] focus:ring-2 focus:ring-[#bfe0b8]" placeholder="you@example.com" /></label><label className="grid gap-2 text-sm font-bold text-[#49634f]">Password<div className="relative"><input required minLength={mode === "register" ? 8 : 1} type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-12 w-full rounded-xl border border-[#cddccc] px-3 pr-12 font-normal outline-none focus:border-[#4a965e] focus:ring-2 focus:ring-[#bfe0b8]" placeholder={mode === "register" ? "At least 8 characters" : "Your password"} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg text-[#5c7862]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>{mode === "register" && <label className="grid gap-2 text-sm font-bold text-[#49634f]">Confirm password<input required minLength={8} type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="h-12 rounded-xl border border-[#cddccc] px-3 font-normal outline-none focus:border-[#4a965e] focus:ring-2 focus:ring-[#bfe0b8]" placeholder="Repeat your password" /></label>}{(error || friendlyBackendError) && <p role="alert" className="rounded-xl bg-[#fff0ec] px-3 py-2 text-sm font-semibold text-[#a64f42]">{error || friendlyBackendError}</p>}<button disabled={mutation.isPending} className="mt-2 flex h-12 items-center justify-center rounded-xl bg-[#1d6a3b] text-sm font-bold text-white shadow-sm hover:bg-[#15562f] disabled:cursor-not-allowed disabled:opacity-60">{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working…</> : mode === "login" ? "Sign in" : "Create account"}</button></form><p className="mt-7 text-center text-sm text-[#718071]">{mode === "login" ? "New to AgroSmart? " : "Already have an account? "}<Link href={mode === "login" ? "/register" : "/login"} className="font-bold text-[#347b4c]">{mode === "login" ? "Create an account" : "Sign in"}</Link></p>
      </section>
    </main>
  </div>;
}
