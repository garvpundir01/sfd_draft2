import { useState } from "react";
import { createCategory } from "../api";
import Card from "./Card";

export default function AddCategoryForm({ onCreated }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState("EXPENSE");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setSaving(true);
    try {
      const cat = await createCategory({ name, kind });
      setName(""); setKind("EXPENSE");
      onCreated?.(cat); // let parent refresh UI
    } catch (e) {
      console.error(e);
      setErr("Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Add Category">
      <form onSubmit={submit} style={{display:"grid", gap:8}}>
        <input
          placeholder="Name (e.g., Groceries)"
          value={name}
          onChange={e=>setName(e.target.value)}
          required
          className="select"
        />
        <select value={kind} onChange={e=>setKind(e.target.value)} className="select">
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Create"}</button>
        {err && <div style={{color:"tomato"}}>{err}</div>}
      </form>
    </Card>
  );
}
