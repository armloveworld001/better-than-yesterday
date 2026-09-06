import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "./supabaseClient";
import Login from "./Login";

const CATEGORIES = [
  { id: "health", label: "สุขภาพ", color: "#2F4538" },
  { id: "mind", label: "จิตใจ", color: "#8A6D3B" },
  { id: "work", label: "การทำงาน", color: "#5B4B8A" },
];

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

function seedEntries() {
  const out = [];
  const cats = ["health", "work", "mind", "health", "work"];
  const texts = [
    "เดินขึ้นบันไดแทนลิฟต์",
    "จัดลำดับงานก่อนเริ่มวัน",
    "ไม่เช็คมือถือตอนตื่นนอน",
    "นอนก่อนเที่ยงคืน",
    "ตอบอีเมลค้างให้หมดก่อนเที่ยง",
  ];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: dateKey(d), category: cats[4 - i], text: texts[4 - i] });
  }
  return out;
}

function computeStreak(entries) {
  const dates = new Set(entries.map((e) => e.date));
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (!dates.has(dateKey(start))) {
    start.setDate(start.getDate() - 1);
  }
  let streak = 0;
  const cursor = new Date(start);
  while (dates.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function buildCompoundSeries(sortedEntries) {
  let value = 0;
  return sortedEntries.map((e, i) => {
    value = value * 1.01 + 1;
    return { day: i + 1, date: e.date, value: Math.round(value * 10) / 10 };
  });
}

function PhoneChrome({ children }) {
  return (
    <div
      style={{
        width: 360,
        margin: "0 auto",
        background: "#F3F1E9",
        borderRadius: 34,
        border: "1px solid #DAD5C6",
        overflow: "hidden",
        fontFamily: "'Public Sans','Noto Sans Thai',sans-serif",
        color: "#26301F",
      }}
    >
      <div style={{ height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 70, height: 5, borderRadius: 3, background: "#C8C2AE" }} />
      </div>
      <div style={{ minHeight: 560, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

function TopLabel({ eyebrow, title }) {
  return (
    <div style={{ padding: "18px 22px 8px" }}>
      <div style={{ fontSize: 12, color: "#7A7360", marginBottom: 2 }}>{eyebrow}</div>
      <div style={{ fontFamily: "'Fraunces','Noto Serif Thai',serif", fontSize: 22, lineHeight: 1.3, color: "#26301F" }}>
        {title}
      </div>
    </div>
  );
}

function TodayScreen({ entries, onSave, streak }) {
  const [text, setText] = useState("");
  const [cat, setCat] = useState(null);
  const todayStr = dateKey(new Date());
  const alreadyLoggedToday = entries.some((e) => e.date === todayStr);
  const canSave = text.trim().length > 0 && cat;

  function handleSave() {
    if (!canSave) return;
    onSave({ date: todayStr, category: cat, text: text.trim() });
    setText("");
    setCat(null);
  }

  const recent = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12);

  return (
    <>
      <TopLabel eyebrow={todayStr} title="วันนี้คุณทำอะไรดีกว่าเมื่อวาน?" />

      {alreadyLoggedToday ? (
        <div style={{ padding: "0 22px 10px", fontSize: 13, color: "#7A7360" }}>
          บันทึกวันนี้แล้ว ✓ — กลับมาพรุ่งนี้ได้เลย
        </div>
      ) : (
        <>
          <div style={{ padding: "6px 22px 14px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => {
              const active = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: `1px solid ${active ? c.color : "#DAD5C6"}`,
                    background: active ? c.color : "transparent",
                    color: active ? "#FBF9F2" : "#57503F",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div style={{ padding: "0 22px" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="พิมพ์สั้น ๆ พอ… ไม่ต้องยาว"
              rows={3}
              style={{
                width: "100%",
                resize: "none",
                border: "none",
                borderBottom: "1px dashed #C8C2AE",
                background: "transparent",
                outline: "none",
                fontSize: 15,
                color: "#26301F",
                padding: "8px 2px",
                fontFamily: "inherit",
              }}
            />
          </div>
          <div style={{ padding: "10px 22px 4px" }}>
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: "none",
                background: canSave ? "#2F4538" : "#DAD5C6",
                color: canSave ? "#FBF9F2" : "#7A7360",
                fontSize: 14,
                cursor: canSave ? "pointer" : "not-allowed",
              }}
            >
              บันทึกวันนี้
            </button>
          </div>
        </>
      )}

      <div style={{ padding: "16px 22px 4px", fontSize: 12, color: "#7A7360" }}>ต่อเนื่อง {streak} วัน</div>

      <div style={{ padding: "6px 10px 20px", flex: 1, overflowY: "auto" }}>
        {recent.map((item, i) => {
          const meta = CATEGORIES.find((c) => c.id === item.category);
          return (
            <div key={i} style={{ padding: "10px 12px", margin: "4px 12px", borderLeft: `2px solid ${meta.color}`, background: "#FBF9F2", borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: meta.color, marginBottom: 2 }}>{item.date} · {meta.label}</div>
              <div style={{ fontSize: 13.5, color: "#26301F" }}>{item.text}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function GrowthScreen({ entries }) {
  const sorted = [...entries].sort((a, b) => (a.date > b.date ? 1 : -1));
  const data = useMemo(() => buildCompoundSeries(sorted.length ? sorted : [{ date: dateKey(new Date()) }]), [entries]);
  const last = data[data.length - 1];

  return (
    <>
      <TopLabel eyebrow="การสะสมความเก่ง" title="ทีละนิด แล้วมันจะทบต้น" />
      <div style={{ padding: "0 22px 6px" }}>
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 32, color: "#2F4538" }}>{last.value}</span>
        <span style={{ fontSize: 13, color: "#7A7360", marginLeft: 6 }}>คะแนนสะสมจาก {sorted.length} วันที่บันทึก</span>
      </div>
      <div style={{ height: 200, padding: "6px 10px 0" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7A7360" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#7A7360" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #DAD5C6" }} labelFormatter={(d) => `วัน ${d}`} />
            <Line type="monotone" dataKey="value" stroke="#2F4538" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ padding: "14px 22px", fontSize: 13, color: "#57503F", lineHeight: 1.6 }}>
        เส้นนี้วัดความต่อเนื่องของการกลับมาบันทึก ไม่ใช่คุณภาพของแต่ละวัน — ยิ่งต่อเนื่องนาน เส้นยิ่งโค้งขึ้นเร็ว
      </div>
      <div style={{ padding: "0 22px", display: "flex", gap: 10, marginTop: "auto", marginBottom: 18 }}>
        {CATEGORIES.map((c) => {
          const count = entries.filter((l) => l.category === c.id).length;
          return (
            <div key={c.id} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "'Fraunces',serif", color: c.color }}>{count}</div>
              <div style={{ fontSize: 11, color: "#7A7360" }}>{c.label}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CapsuleScreen({ entries }) {
  const total = entries.length;
  const byCat = CATEGORIES.map((c) => ({ ...c, count: entries.filter((l) => l.category === c.id).length }));
  const max = Math.max(1, ...byCat.map((c) => c.count));

  return (
    <>
      <TopLabel eyebrow="สรุปความทรงจำ" title="ใบสรุปความสำเร็จของคุณ" />
      <div style={{ padding: "0 22px" }}>
        <div style={{ border: "1px solid #DAD5C6", borderRadius: 12, padding: 18, background: "#FBF9F2" }}>
          <div style={{ fontSize: 12, color: "#7A7360" }}>รวมทั้งหมด</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 30, color: "#2F4538", margin: "2px 0 14px" }}>{total} วันที่ดีกว่าเมื่อวาน</div>
          {byCat.map((c) => (
            <div key={c.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ color: "#57503F" }}>{c.label}</span>
                <span style={{ color: "#7A7360" }}>{c.count}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#EFEBDD" }}>
                <div style={{ height: "100%", width: `${(c.count / max) * 100}%`, background: c.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 22px", fontSize: 13, color: "#57503F", lineHeight: 1.6 }}>
        ใบนี้คือสิ่งที่ผู้ใช้เห็นตอนสิ้นปี — เก็บทุกวันเล็ก ๆ ไว้ แล้วให้มันประกอบร่างเป็นภาพใหญ่ทีหลัง
      </div>
      <div style={{ padding: "0 22px", marginTop: "auto", marginBottom: 20 }}>
        <button style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "1px solid #2F4538", background: "transparent", color: "#2F4538", fontSize: 14 }}>
          แชร์ใบสรุปนี้
        </button>
      </div>
    </>
  );
}

function SettingsScreen({ settings, onChangeSettings, onReset }) {
  return (
    <>
      <TopLabel eyebrow="การแจ้งเตือน" title="ตั้งค่าการเตือนเบา ๆ" />
      <div style={{ padding: "0 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #DAD5C6" }}>
          <span style={{ fontSize: 14 }}>เปิดการแจ้งเตือนทุกเย็น</span>
          <button
            onClick={() => onChangeSettings({ ...settings, reminderEnabled: !settings.reminderEnabled })}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: "none",
              background: settings.reminderEnabled ? "#2F4538" : "#DAD5C6",
              position: "relative",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#FBF9F2", position: "absolute", top: 3, left: settings.reminderEnabled ? 23 : 3, transition: "left 120ms" }} />
          </button>
        </div>
        {settings.reminderEnabled && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
            <span style={{ fontSize: 14 }}>เวลาที่เตือน</span>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => onChangeSettings({ ...settings, reminderTime: e.target.value })}
              style={{ border: "1px solid #DAD5C6", borderRadius: 6, padding: "4px 8px", fontSize: 13, background: "#FBF9F2" }}
            />
          </div>
        )}
      </div>
      <div style={{ padding: "10px 22px", fontSize: 12, color: "#9A927B", lineHeight: 1.6 }}>
        หมายเหตุ: preview นี้ยังไม่ส่ง push notification จริง — ค่าที่ตั้งไว้ถูกบันทึกไว้เพื่อออกแบบ flow เท่านั้น
      </div>
      <div style={{ padding: "18px 22px", marginTop: "auto" }}>
        <button onClick={onReset} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid #B5473F", background: "transparent", color: "#B5473F", fontSize: 13 }}>
          ล้างข้อมูลทดสอบทั้งหมด
        </button>
      </div>
    </>
  );
}

export default function App() {
  const [entries, setEntries] = useState(null);
  const [settings, setSettings] = useState({ reminderEnabled: false, reminderTime: "20:00" });
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", session.user.id)
        .order("entry_date", { ascending: false });

      if (error) {
        setEntries(seedEntries());
      } else {
        setEntries(
          data.map((row) => ({
            date: row.entry_date,
            category: row.category,
            text: row.content,
          }))
        );
      }

      try {
        const s = await window.storage.get("settings", false);
        if (s) setSettings(JSON.parse(s.value));
      } catch (err) {
        // no saved settings yet, keep defaults
      }
      setLoading(false);
    })();
  }, [session]);

  function saveEntries(next) {
    setEntries(next);
  }

  async function saveSettings(next) {
    setSettings(next);
    try {
      await window.storage.set("settings", JSON.stringify(next), false);
    } catch (err) {
      setErrorMsg("บันทึกการตั้งค่าไม่สำเร็จ");
    }
  }

  async function handleAddEntry(entry) {
    const { error } = await supabase.from("entries").insert({
      user_id: session.user.id,
      entry_date: entry.date,
      category: entry.category,
      content: entry.text,
    });
    if (error) {
      setErrorMsg("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
      return;
    }
    saveEntries([entry, ...(entries || [])]);
  }

  async function handleReset() {
    const fresh = seedEntries();
    await saveEntries(fresh);
    await saveSettings({ reminderEnabled: false, reminderTime: "20:00" });
  }

  const streak = useMemo(() => (entries ? computeStreak(entries) : 0), [entries]);

  const tabs = [
    { id: "today", label: "วันนี้" },
    { id: "growth", label: "การเติบโต" },
    { id: "capsule", label: "สรุปสิ้นปี" },
    { id: "settings", label: "ตั้งค่า" },
  ];

  if (authLoading) return <p>กำลังตรวจสอบสถานะเข้าสู่ระบบ…</p>;
  if (!session) return <Login />;

  return (
    <div style={{ padding: "28px 12px", background: "#EAE6D8", minHeight: 640 }}>
      <PhoneChrome>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#7A7360", fontSize: 13 }}>กำลังโหลดข้อมูล…</div>
          ) : (
            <>
              {errorMsg && (
                <div style={{ padding: "8px 22px", fontSize: 12, color: "#B5473F" }}>{errorMsg}</div>
              )}
              {tab === "today" && <TodayScreen entries={entries} onSave={handleAddEntry} streak={streak} />}
              {tab === "growth" && <GrowthScreen entries={entries} />}
              {tab === "capsule" && <CapsuleScreen entries={entries} />}
              {tab === "settings" && <SettingsScreen settings={settings} onChangeSettings={saveSettings} onReset={handleReset} />}
            </>
          )}
        </div>
        <div style={{ display: "flex", borderTop: "1px solid #DAD5C6", background: "#FBF9F2" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "14px 0",
                border: "none",
                background: "transparent",
                fontSize: 12,
                color: tab === t.id ? "#2F4538" : "#9A927B",
                fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer",
                borderTop: tab === t.id ? "2px solid #2F4538" : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </PhoneChrome>
    </div>
  );
}
