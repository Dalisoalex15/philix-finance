import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, RefreshCw, ArrowLeft, Mail } from "lucide-react";
import { savePortalTokens } from "../../lib/api";

const API = import.meta.env.VITE_API_URL || "/api";

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = params.get("email") || "";
  const type = (params.get("type") || "EMAIL_VERIFY") as "EMAIL_VERIFY" | "PASSWORD_RESET";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleDigit(idx: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = cleaned;
    setDigits(next);
    setError("");
    if (cleaned && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = text[i] || "";
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  }

  async function handleSubmit() {
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter the 6-digit code."); return; }

    setLoading(true); setError(""); setSuccess("");
    try {
      const r = await fetch(`${API}/portal/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type }),
      });
      const data = await r.json();

      if (!r.ok) { setError(data.message || data.error || "Invalid code."); return; }

      if (type === "EMAIL_VERIFY") {
        savePortalTokens(data.accessToken, data.refreshToken);
        setSuccess("Email verified! Redirecting to your dashboard…");
        setTimeout(() => navigate("/portal/dashboard", { replace: true }), 1200);
      } else {
        // PASSWORD_RESET — pass resetToken to reset page
        navigate(`/portal/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`, { replace: true });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setResending(true); setError(""); setSuccess("");
    try {
      const r = await fetch(`${API}/portal/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.message || data.error || "Failed to resend."); return; }
      setSuccess("New code sent! Check your inbox.");
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  const isComplete = digits.every(d => d !== "");

  return (
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#C9A84C,#E8C96A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={22} color="#0A1F44" />
            </div>
            <span style={{ color: "#f8fafc", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>PHILIX</span>
            <span style={{ color: "#64748b", fontSize: "11px", letterSpacing: "2px", fontWeight: 500 }}>FINANCE</span>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "20px", padding: "40px 36px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(201,168,76,0.12)", border: "2px solid rgba(201,168,76,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Mail size={28} color="#C9A84C" />
          </div>

          <h1 style={{ color: "#f8fafc", fontSize: "22px", fontWeight: 800, margin: "0 0 8px" }}>
            {type === "PASSWORD_RESET" ? "Reset Your Password" : "Verify Your Email"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 8px", lineHeight: 1.6 }}>
            {type === "PASSWORD_RESET" ? "Enter the reset code we sent to" : "Enter the 6-digit code we sent to"}
          </p>
          <p style={{ color: "#C9A84C", fontSize: "14px", fontWeight: 600, margin: "0 0 32px", wordBreak: "break-all" }}>
            {email}
          </p>

          {/* OTP inputs */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "28px" }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                style={{
                  width: "52px", height: "60px",
                  textAlign: "center", fontSize: "24px", fontWeight: 700,
                  background: d ? "rgba(201,168,76,0.1)" : "#0f172a",
                  border: `2px solid ${d ? "#C9A84C" : "#1e3a5f"}`,
                  borderRadius: "12px",
                  color: d ? "#C9A84C" : "#94a3b8",
                  outline: "none",
                  cursor: "text",
                  transition: "all 0.15s",
                  caretColor: "#C9A84C",
                }}
              />
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#fca5a5", fontSize: "13px" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#4ade80", fontSize: "13px" }}>
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            style={{
              width: "100%", height: "50px", borderRadius: "12px", border: "none",
              background: isComplete ? "linear-gradient(135deg,#C9A84C,#E8C96A)" : "#1e293b",
              color: isComplete ? "#0A1F44" : "#475569",
              fontWeight: 700, fontSize: "15px", cursor: isComplete ? "pointer" : "not-allowed",
              marginBottom: "16px", transition: "all 0.2s",
            }}
          >
            {loading ? "Verifying…" : type === "PASSWORD_RESET" ? "Verify Code" : "Verify & Activate"}
          </button>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            style={{ background: "none", border: "none", color: countdown > 0 ? "#475569" : "#C9A84C", fontSize: "13px", cursor: countdown > 0 ? "default" : "pointer", display: "flex", alignItems: "center", gap: "6px", margin: "0 auto" }}
          >
            {resending ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {countdown > 0 ? `Resend code in ${countdown}s` : resending ? "Sending…" : "Resend code"}
          </button>
        </div>

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={() => navigate(type === "PASSWORD_RESET" ? "/portal/login" : "/portal/register")}
            style={{ background: "none", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={14} />
            {type === "PASSWORD_RESET" ? "Back to login" : "Back to register"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
