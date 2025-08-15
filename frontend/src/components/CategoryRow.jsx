import { useState } from "react";
import { updateCategory, deleteCategory } from "../api";
import CategoryBadge from "./CategoryBadge";

export default function CategoryRow({ cat, onChanged, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [kind, setKind] = useState(cat.kind);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true); setErr("");
    try {
      await updateCategory(cat.id, { name, kind });
      setEditing(false);
      onChanged?.();
    } catch (e) {
      console.error(e);
      setErr("Failed to save category");
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      onDeleted?.();
    } catch (e) {
      console.error(e);
      alert("Failed to delete category");
    }
  }

  if (editing) {
    return (
      <li style={{ display:"grid", gap:8, marginBottom:8 }}>
        <input className="select" value={name} onChange={e=>setName(e.target.value)} />
        <select className="select" value={kind} onChange={e=>setKind(e.target.value)}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <div style={{display:"flex", gap:8}}>
          <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          <button className="btn" onClick={()=>{ setEditing(false); setName(cat.name); setKind(cat.kind); }}>Cancel</button>
        </div>
        {err && <div style={{color:"tomato"}}>{err}</div>}
      </li>
    );
  }

  return (
    <li style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
      <CategoryBadge name={cat.name} kind={cat.kind} />
      <div style={{display:"flex", gap:8}}>
        <button className="btn" onClick={()=>setEditing(true)}>Edit</button>
        <button className="btn btn-danger" onClick={remove}>Delete</button>
      </div>
    </li>
  );
}
