import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogleLogin() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      setError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
    // สำเร็จแล้วเบราว์เซอร์จะ redirect ไป Google เองแบบอัตโนมัติ ไม่ต้องทำอะไรเพิ่ม
  }

  async function handleSendMagicLink() {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError("ส่งลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง");
      return;
    }
    setSent(true);
  }

  return (
    <div
      style={{
        padding: 32,
        fontFamily: "'Public Sans','Noto Sans Thai',sans-serif",
        maxWidth: 360,
        margin: "40px auto",
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: "'Fraunces','Noto Serif Thai',serif", fontSize: 22, marginBottom: 24, color: "#e6fd10" }}>
        วันนี้คุณทำอะไรดีกว่าเมื่อวาน?
      </div>

      <button
        onClick={handleGoogleLogin}
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: 10,
          border: "1px solid #DAD5C6",
          background: "#FBF9F2",
          color: "#26301F",
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
        เข้าสู่ระบบด้วย Google
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0", color: "#9A927B", fontSize: 12 }}>
        <div style={{ flex: 1, height: 1, background: "#DAD5C6" }} />
        หรือ
        <div style={{ flex: 1, height: 1, background: "#DAD5C6" }} />
      </div>

      {sent ? (
        <p style={{ fontSize: 13, color: "#57503F" }}>เช็คอีเมล {email} แล้วกดลิงก์เพื่อเข้าสู่ระบบ</p>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="อีเมลของคุณ"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #DAD5C6",
              marginBottom: 10,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSendMagicLink}
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: "#2F4538",
              color: "#FBF9F2",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ส่งลิงก์เข้าสู่ระบบทางอีเมล
          </button>
        </>
      )}

      {error && <p style={{ color: "#B5473F", fontSize: 13, marginTop: 12 }}>{error}</p>}
    </div>
  );
}
