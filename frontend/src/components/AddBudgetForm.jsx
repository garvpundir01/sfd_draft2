import { useState, useEffect } from "react";
import Card from "./Card";
import { createBudget } from "../api";

function toMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || "Request failed";
  if (typeof data === "string") return data;
  return Object.entries(data)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join(" | ");
}

export default function AddBudgetForm({ cats = [], onCreated }) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!cats.length) { setCategory(""); return; }
    const exists = cats.some(c => String(c.id) === String(category));
    if (!category || !exists) setCategory(String(cats[0].id));
  }, [cats, category]);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setSaving(true);
    try {
      await createBudget({ category: Number(category), limit: Number(limit) });
      setLimit("");
      onCreated?.();
    } catch (e) {
      console.error(e);
      setErr(toMessage(e));
    } finally { setSaving(false); }
  }

  return (
    <Card title="Add Budget">
      <form onSubmit={submit} style={{display:"grid", gap:8}}>
        <select className="select" value={category} onChange={e=>setCategory(e.target.value)} required>
          {!cats.length && <option value="">(No categories)</option>}
          {cats.map(c => <option key={c.id} value={c.id}>{c.name} ({c.kind})</option>)}
        </select>
        <input
          className="select"
          type="number" step="0.01"
          placeholder="Monthly limit (e.g., 400.00)"
          value={limit} onChange={e=>setLimit(e.target.value)} required
        />
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Create"}</button>
        {err && <div style={{color:"tomato"}}>{err}</div>}
      </form>
    </Card>
  );
}
