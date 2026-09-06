import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend() {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError("ส่งลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <p>เช็คอีเมล {email} แล้วกดลิงก์เพื่อเข้าสู่ระบบ</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="อีเมลของคุณ"
        style={{ padding: 8, marginRight: 8 }}
      />
      <button onClick={handleSend} style={{ padding: "8px 16px" }}>
        ส่งลิงก์เข้าสู่ระบบ
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
