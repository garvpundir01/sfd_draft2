import Card from "./Card";
import { useEffect, useState, useMemo } from "react";
import { listBudgets, updateBudget, deleteBudget } from "../api";

function BudgetRow({ b, cats, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(String(b.category));
  const [limit, setLimit] = useState(String(b.limit));

  const catName = useMemo(
    () => cats.find((c) => c.id === b.category)?.name || "—",
    [cats, b.category]
  );

  async function save() {
    try {
      await updateBudget(b.id, { category: Number(category), limit: Number(limit) });
      setEditing(false);
      onChanged?.(); // bubble up
    } catch (e) {
      console.error(e);
      alert("Failed to save budget");
    }
  }

  async function remove() {
    if (!confirm("Delete this budget?")) return;
    try {
      await deleteBudget(b.id);
      onChanged?.(); // bubble up
    } catch (e) {
      console.error(e);
      alert("Failed to delete budget");
    }
  }

  if (editing) {
    return (
      <tr>
        <td>
          <select className="select" value={category} onChange={(e)=>setCategory(e.target.value)}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </td>
        <td>
          <input className="select" type="number" step="0.01" value={limit} onChange={(e)=>setLimit(e.target.value)} />
        </td>
        <td style={{whiteSpace:"nowrap"}}>
          <button className="btn" onClick={save}>Save</button>
          <button className="btn" onClick={()=>{ setEditing(false); setCategory(String(b.category)); setLimit(String(b.limit)); }} style={{marginLeft:6}}>Cancel</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{catName}</td>
      <td>${Number(b.limit).toLocaleString()}</td>
      <td style={{whiteSpace:"nowrap"}}>
        <button className="btn" onClick={()=>setEditing(true)}>Edit</button>
        <button className="btn btn-danger" onClick={remove} style={{marginLeft:6}}>Delete</button>
      </td>
    </tr>
  );
}

export default function BudgetsList({ cats = [], refreshSignal, onChanged }) {
  const [budgets, setBudgets] = useState([]);

  async function load() {
    try {
      const data = await listBudgets();
      setBudgets(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { load(); }, [refreshSignal]);

  return (
    <Card title="Budgets">
      {budgets.length ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ textAlign: "left", opacity: 0.8 }}>
              <tr>
                <th>Category</th>
                <th>Monthly Limit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <BudgetRow key={b.id} b={b} cats={cats} onChanged={onChanged} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ opacity: 0.7 }}>No budgets yet.</div>
      )}
    </Card>
  );
}
