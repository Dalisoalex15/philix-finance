import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Send, Loader2, ChevronDown,
  CheckCircle, AlertCircle, Camera, ArrowRight, FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientAuthStore, type ClientUser } from "../../store/clientAuth";
import { useLoanApplicationStore, type LoanApplication } from "../../store/loanApplicationStore";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  time: Date;
  applicationData?: PendingApp;
  applicationResult?: { reference: string; status: "success" | "error"; message: string };
}

interface PendingApp {
  productType: string;
  amountRequested: number;
  termMonths: number;
  purpose: string;
  description?: string;
  occupation?: string;
  employer?: string;
  employerPhone?: string;
  monthlyIncome?: number;
  employmentType?: string;
  payDate?: string;
  collateralType?: string;
  collateralDesc?: string;
  collateralValue?: number;
  ref1Name?: string;
  ref1Phone?: string;
  ref1Relation?: string;
  ref2Name?: string;
  ref2Phone?: string;
  ref2Relation?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
}

const PRODUCT_NAMES: Record<string, string> = {
  "prod-001": "Quick Salary Loan",
  "prod-002": "Student Loan",
  "prod-003": "Business Growth Loan",
  "prod-004": "Agricultural Input Loan",
  "prod-005": "Repeat Client Loyalty Loan",
  "prod-006": "Premium Client Loan",
};

const RATES: Record<string, Record<number, number>> = {
  "prod-001": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-002": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-003": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-004": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-005": { 1:  8, 2: 16, 3: 24, 4: 30 },
  "prod-006": { 1:  7, 2: 14, 3: 21, 4: 28 },
};

const Kw = (n: number) => `K${Math.round(n).toLocaleString()}`;
const fmtDate = (d: Date) => d.toLocaleDateString("en-ZM", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtShort = (d: Date) => d.toLocaleDateString("en-ZM", { day: "numeric", month: "short" });

function dueDate(app: LoanApplication) {
  return new Date(new Date(app.submittedAt).getTime() + (app.termMonths ?? 1) * 7 * 86_400_000);
}
function daysLeft(app: LoanApplication) {
  return Math.ceil((dueDate(app).getTime() - Date.now()) / 86_400_000);
}
function totalDue(app: LoanApplication) {
  return app.totalRepayable || app.amount * (1 + (app.interestRate ?? 0) / 100);
}
function weeklyPay(app: LoanApplication) {
  return app.weeklyPayment || totalDue(app) / (app.termMonths ?? 1);
}

function buildContext(client: ClientUser, myApps: LoanApplication[]) {
  const active    = myApps.filter(a => a.status === "DISBURSED");
  const pending   = myApps.filter(a => a.status === "PENDING" || a.status === "UNDER_REVIEW");
  const approved  = myApps.filter(a => a.status === "APPROVED");
  const rejected  = myApps.filter(a => a.status === "REJECTED");
  const overdue   = active.filter(a => daysLeft(a) < 0);
  const dueSoon   = active.filter(a => { const d = daysLeft(a); return d >= 0 && d <= 3; });
  const totalOwed = active.reduce((s, a) => s + totalDue(a), 0);
  const completed = myApps.filter(a => a.status === "DISBURSED").length;
  const kycOk     = client.kycStatus === "VERIFIED";
  return { active, pending, approved, rejected, overdue, dueSoon, totalOwed, completed, kycOk };
}

function buildGreeting(client: ClientUser, ctx: ReturnType<typeof buildContext>): string {
  const name = client.firstName;
  const lines: string[] = [];
  if (ctx.overdue.length > 0) {
    const loan = ctx.overdue[0];
    const late = Math.abs(daysLeft(loan));
    lines.push(`⚠️ **Urgent, ${name}!** Your loan **${loan.ref}** (${Kw(loan.amount)}) is **${late} day${late > 1 ? "s" : ""} overdue**. Please call us NOW on **+260 777 158 901** before penalties grow further.`);
  }
  if (ctx.approved.length > 0) {
    const a = ctx.approved[0];
    lines.push(`🎉 **Great news!** Your loan **${a.ref}** (${Kw(a.amount)}) has been **APPROVED**! Come to the Philix office to collect your money. Call +260 777 158 901 to confirm.`);
  }
  if (ctx.dueSoon.length > 0 && ctx.overdue.length === 0) {
    const loan = ctx.dueSoon[0];
    const d = daysLeft(loan);
    lines.push(`⏰ **Reminder, ${name}:** Your loan **${loan.ref}** is due in **${d === 0 ? "today!" : `${d} day${d > 1 ? "s" : ""}`}** — ${Kw(totalDue(loan))} on ${fmtShort(dueDate(loan))}.`);
  }
  if (ctx.pending.length > 0 && ctx.overdue.length === 0 && ctx.approved.length === 0) {
    const p = ctx.pending[0];
    lines.push(`⏳ **Your application ${p.ref}** (${Kw(p.amount)}) is under review. Expect a decision within 24–48 hours.`);
  }
  const intro = lines.length > 0
    ? `Hello ${name}! I'm Philix AI. Here's your account snapshot:\n\n${lines.join("\n\n")}`
    : `Hello ${name}! 👋 I'm your Philix AI loan advisor.`;
  const snapshot: string[] = [];
  if (ctx.active.length > 0)  snapshot.push(`💳 ${ctx.active.length} active loan${ctx.active.length > 1 ? "s" : ""} · Total owed: ${Kw(ctx.totalOwed)}`);
  if (ctx.pending.length > 0) snapshot.push(`⏳ ${ctx.pending.length} application${ctx.pending.length > 1 ? "s" : ""} under review`);
  if (ctx.completed > 0)      snapshot.push(`✅ ${ctx.completed} completed loan${ctx.completed > 1 ? "s" : ""}`);
  if (!ctx.kycOk)             snapshot.push(`📋 KYC not verified — complete it for higher limits`);
  const help = `\n\nI can help you:\n• **Apply for a loan** — just say "I want a loan" and I'll guide you\n• "How much do I owe?" · "When is my loan due?"\n• "Best loan for me" · "Calculate K3000 for 2 weeks"\n• "My account details" · "Improve my chances"\n\nJust ask naturally — I know your account!`;
  if (snapshot.length > 0 && lines.length === 0) return `${intro}\n\n${snapshot.join("\n")}${help}`;
  return `${intro}${help}`;
}

function getQuickReplies(client: ClientUser, myApps: LoanApplication[]): string[] {
  const ctx = buildContext(client, myApps);
  if (ctx.overdue.length > 0) return ["How much do I owe?", "Am I overdue?", "My loan status", "Contact Philix"];
  if (ctx.approved.length > 0) return ["My loan status", "Contact Philix", "How much do I owe?", "Apply for a loan"];
  if (ctx.active.length > 0) return ["How much do I owe?", "When is my loan due?", "Apply for a loan", "My account details"];
  if (ctx.pending.length > 0) return ["My loan status", "How long does approval take?", "Apply for a loan", "Improve my chances"];
  return ["Apply for a loan", "Best loan for me", "Calculate K2000 for 2 weeks", "My account details"];
}

function RenderMessage({ text }: { text: string }) {
  return (
    <div className="text-[13px] leading-relaxed space-y-0.5">
      {text.split("\n").map((line, i) => {
        const html = line
          .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
          .replace(/__(.*?)__/g, "<u>$1</u>");
        return <p key={i} className={line === "" ? "h-1.5" : ""} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}

function LoanConfirmCard({ app, onConfirm, onCancel, submitting }: {
  app: PendingApp;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const productName = PRODUCT_NAMES[app.productType] ?? app.productType;
  const rate = RATES[app.productType]?.[app.termMonths] ?? 20;
  const interest = app.amountRequested * (rate / 100);
  const totalRepay = app.amountRequested + interest;
  const weeklyAmt = totalRepay / (app.termMonths || 1);

  return (
    <div className="bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-3.5 text-xs space-y-3">
      <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
        <FileText size={12} /> Application Ready to Submit
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div>
          <div className="text-indigo-400/60">Product</div>
          <div className="text-white font-semibold">{productName}</div>
        </div>
        <div>
          <div className="text-indigo-400/60">Amount</div>
          <div className="text-[#C9A227] font-black text-sm">K{app.amountRequested.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-indigo-400/60">Term</div>
          <div className="text-white">{app.termMonths} week{app.termMonths !== 1 ? "s" : ""}</div>
        </div>
        <div>
          <div className="text-indigo-400/60">Interest ({rate}% flat)</div>
          <div className="text-white">K{Math.round(interest).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-indigo-400/60">Total to repay</div>
          <div className="text-emerald-400 font-bold">K{Math.round(totalRepay).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-indigo-400/60">Weekly payment</div>
          <div className="text-white">K{Math.round(weeklyAmt).toLocaleString()}</div>
        </div>
        <div className="col-span-2">
          <div className="text-indigo-400/60">Purpose</div>
          <div className="text-white">{app.purpose}</div>
        </div>
        {app.employer && (
          <div>
            <div className="text-indigo-400/60">Employer</div>
            <div className="text-white truncate">{app.employer}</div>
          </div>
        )}
        {app.monthlyIncome && (
          <div>
            <div className="text-indigo-400/60">Monthly income</div>
            <div className="text-white">K{app.monthlyIncome.toLocaleString()}</div>
          </div>
        )}
        {app.collateralType && (
          <div className="col-span-2">
            <div className="text-indigo-400/60">Collateral</div>
            <div className="text-white">{app.collateralType}{app.collateralDesc ? ` — ${app.collateralDesc}` : ""}{app.collateralValue ? ` (~K${app.collateralValue.toLocaleString()})` : ""}</div>
          </div>
        )}
        {app.ref1Name && (
          <div className="col-span-2">
            <div className="text-indigo-400/60">References</div>
            <div className="text-white">{app.ref1Name} ({app.ref1Relation}){app.ref2Name ? ` · ${app.ref2Name} (${app.ref2Relation})` : ""}</div>
          </div>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-amber-300 text-[10px]">
        📸 After submitting, go to <strong>Collateral</strong> in the menu to upload photos of your item.
      </div>

      <div className="flex gap-2 pt-0.5">
        <button onClick={onConfirm} disabled={submitting}
          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-[12px] py-2.5 rounded-xl transition-all">
          {submitting ? <><Loader2 size={12} className="animate-spin" /> Submitting…</> : <><CheckCircle size={12} /> Confirm & Submit</>}
        </button>
        <button onClick={onCancel} disabled={submitting}
          className="px-3 py-2.5 text-[12px] text-indigo-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
          Changes
        </button>
      </div>
    </div>
  );
}

function LoanSuccessCard({ reference, onUploadPhotos }: { reference: string; onUploadPhotos: () => void }) {
  return (
    <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-3.5 text-xs space-y-3">
      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
        <CheckCircle size={14} /> Application Submitted!
      </div>
      <div>
        <div className="text-emerald-400/60 text-[10px]">Reference Number</div>
        <div className="text-white font-black text-base tracking-widest">{reference}</div>
      </div>
      <p className="text-emerald-200/80">Your application is now under review. You'll hear back within 24–48 hours by phone/SMS.</p>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-amber-300 text-[10px] flex items-start gap-2">
        <Camera size={12} className="mt-0.5 flex-shrink-0" />
        <span>Next step: Upload photos of your collateral to speed up approval!</span>
      </div>
      <button onClick={onUploadPhotos}
        className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-[#0B1F3A] font-black text-[12px] py-2.5 rounded-xl transition-all">
        Upload Collateral Photos <ArrowRight size={12} />
      </button>
    </div>
  );
}

export default function PortalChatbot() {
  const navigate      = useNavigate();
  const client        = useClientAuthStore(s => s.client);
  const token         = useClientAuthStore(s => s.accessToken);
  const syncFromApi   = useLoanApplicationStore(s => s.syncFromApi);
  const applications  = useLoanApplicationStore(s => s.applications);

  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [unread, setUnread]     = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const myApps = client ? applications.filter(a => a.clientId === client.id) : [];

  useEffect(() => {
    if (open && messages.length === 0 && client) {
      syncFromApi().then(() => {
        const freshApps = useLoanApplicationStore.getState().applications.filter(a => a.clientId === client.id);
        const ctx = buildContext(client, freshApps);
        setMessages([{ id: "init", role: "bot", time: new Date(), text: buildGreeting(client, ctx) }]);
      });
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const submitApplication = async (msgId: string, app: PendingApp) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/portal/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(app),
      });
      const data = await r.json();
      if (r.ok) {
        // Sync store and update the message with the result
        syncFromApi();
        conversationRef.current = [...conversationRef.current, {
          role: "assistant",
          content: `I've submitted your loan application! Reference: ${data.reference}. Please upload collateral photos in the Collateral section.`,
        }];
        setMessages(prev => prev.map(m => m.id === msgId
          ? { ...m, applicationData: undefined, applicationResult: { reference: data.reference, status: "success", message: "Application submitted successfully!" } }
          : m
        ));
      } else {
        setMessages(prev => prev.map(m => m.id === msgId
          ? { ...m, applicationData: undefined, applicationResult: { reference: "", status: "error", message: data.error ?? "Submission failed. Please try again." } }
          : m
        ));
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === msgId
        ? { ...m, applicationData: undefined, applicationResult: { reference: "", status: "error", message: "Network error. Please try again." } }
        : m
      ));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelApplication = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applicationData: undefined } : m));
    // Tell the AI the client wants to make changes
    send("I want to make some changes to the application.");
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !client) return;
    setInput("");
    setMessages(p => [...p, { id: Date.now().toString(), role: "user", text: trimmed, time: new Date() }]);
    setTyping(true);

    let reply: string;
    let applicationData: PendingApp | undefined;

    try {
      conversationRef.current = [...conversationRef.current, { role: "user", content: trimmed }];
      const r = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: conversationRef.current }),
      });
      if (r.ok) {
        const data = await r.json();
        let rawText: string = data.text;

        // Parse APPLY_LOAN marker
        const markerMatch = rawText.match(/<<APPLY_LOAN:([\s\S]*?)>>/);
        if (markerMatch) {
          try {
            applicationData = JSON.parse(markerMatch[1]);
          } catch { /* ignore parse errors */ }
          rawText = rawText.replace(/<<APPLY_LOAN:[\s\S]*?>>/, "").trim();
        }

        reply = rawText;
        conversationRef.current = [...conversationRef.current, { role: "assistant", content: data.text }];
        if (conversationRef.current.length > 30) conversationRef.current = conversationRef.current.slice(-30);
      } else {
        reply = "I'm having trouble connecting right now. Please try again in a moment, or call us on +260 777 158 901.";
      }
    } catch {
      reply = "I'm having trouble connecting right now. Please try again in a moment, or call us on +260 777 158 901.";
    }

    setTyping(false);
    const msgId = (Date.now() + 1).toString();
    setMessages(p => [...p, { id: msgId, role: "bot", text: reply, time: new Date(), applicationData }]);
    if (!open) setUnread(n => n + 1);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  if (!client) return null;

  const quickReplies = getQuickReplies(client, myApps);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 lg:right-6 z-50 w-[340px] lg:w-[380px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700"
          style={{ height: "min(620px, calc(100vh - 120px))" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-700 to-indigo-600 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-lg">🤖</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">Philix AI</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-indigo-200">Loan advisor · Can apply for you</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1"><X size={16} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-950 px-3 py-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-800/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">🤖</div>
                )}
                <div className={`max-w-[88%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  {msg.text && (
                    <div className={`rounded-2xl px-3.5 py-2.5 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-sm"
                    }`}>
                      {msg.role === "bot" ? <RenderMessage text={msg.text} /> : <p className="text-[13px]">{msg.text}</p>}
                      <div className={`text-[9px] mt-1 text-right ${msg.role === "user" ? "text-indigo-300" : "text-slate-600"}`}>
                        {msg.time.toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  )}

                  {/* Loan application confirmation card */}
                  {msg.applicationData && !msg.applicationResult && (
                    <LoanConfirmCard
                      app={msg.applicationData}
                      submitting={submitting}
                      onConfirm={() => submitApplication(msg.id, msg.applicationData!)}
                      onCancel={() => cancelApplication(msg.id)}
                    />
                  )}

                  {/* Success or error result */}
                  {msg.applicationResult && (
                    msg.applicationResult.status === "success"
                      ? <LoanSuccessCard
                          reference={msg.applicationResult.reference}
                          onUploadPhotos={() => { navigate("/portal/collateral"); setOpen(false); }}
                        />
                      : <div className="bg-red-950/80 border border-red-500/40 rounded-2xl p-3 flex items-center gap-2 text-red-300 text-xs">
                          <AlertCircle size={13} className="flex-shrink-0" />
                          {msg.applicationResult.message}
                        </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-800/50 flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="flex-shrink-0 bg-slate-900 px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
              {quickReplies.map(qr => (
                <button key={qr} onClick={() => send(qr)}
                  className="flex-shrink-0 text-[11px] bg-slate-800 hover:bg-indigo-700 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-600 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap">
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-3 py-2.5 flex gap-2 items-center">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Ask about loans or say 'I want a loan'…"
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            <button onClick={() => send(input)} disabled={!input.trim() || typing}
              className="w-9 h-9 flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition-all">
              {typing ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(v => !v)}
        className={`fixed bottom-[88px] right-4 lg:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          open ? "bg-slate-700 hover:bg-slate-600" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50"
        }`}>
        {open ? <ChevronDown size={20} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unread}</span>
        )}
        {!open && (
          <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap border border-slate-700 pointer-events-none">
            Apply for a Loan
          </span>
        )}
      </button>
    </>
  );
}
