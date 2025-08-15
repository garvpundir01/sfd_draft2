// src/components/AddTransactionForm.jsx
import { useEffect, useState } from "react";
import { createTransaction, listAccounts } from "../api";
import Card from "./Card";

/**
 * Props:
 *  - cats: category list from parent (Dashboard) [{id, name, kind}, ...]
 *  - onCreated: callback after successful create to refresh parent data
 */
export default function AddTransactionForm({ cats = [], onCreated }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [accts, setAccts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Load accounts once
  useEffect(() => {
    (async () => {
      try {
        const a = await listAccounts();
        setAccts(a);
        if (a.length && !account) setAccount(String(a[0].id));
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever categories change in the parent, ensure we have a valid selection
  useEffect(() => {
    if (!cats.length) {
      setCategory(""); // nothing to select
      return;
    }
    // If current selection is empty or no longer exists, pick the first one
    const exists = cats.some((c) => String(c.id) === String(category));
    if (!category || !exists) {
      setCategory(String(cats[0].id));
    }
  }, [cats, category]);

//   async function submit(e) {
//     e.preventDefault();
//     setErr("");
//     setSaving(true);
//     try {
//       const body = {
//         description: desc,
//         amount: Number(amount),            // keep your sign convention (neg for expense if you chose that)
//         occurred_at: date,                 // YYYY-MM-DD
//         category: Number(category),
//         account: account ? Number(account) : null,
//       };
//       await createTransaction(body);
//       // Reset a few fields for quick entry
//       setDesc("");
//       setAmount("");
//       onCreated?.();
//     } catch (e) {
//       console.error(e);
//       setErr("Failed to create transaction");
//     } finally {
//       setSaving(false);
//     }
//   }

  async function submit(e) {
  e.preventDefault();
  setErr("");
  setSaving(true);
  try {
    const amt = Math.abs(Number(amount)); // user can type any sign; we normalize
    const selected = cats.find((c) => String(c.id) === String(category));
    const isExpense = (selected?.kind || "").toUpperCase() === "EXPENSE";

    const body = {
      description: desc,
      amount: isExpense ? -amt : amt,  // 👈 auto-sign
      occurred_at: date,
      category: Number(category),
      account: account ? Number(account) : null,
    };

    await createTransaction(body);
    setDesc("");
    setAmount("");
    onCreated?.();
  } catch (e) {
    console.error(e);
    setErr("Failed to create transaction");
  } finally {
    setSaving(false);
  }
}

  return (
    <Card title="Add Transaction">
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <input
          className="select"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <input
          className="select"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          className="select"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Category dropdown fed from parent */}
        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {!cats.length && <option value="">(No categories yet)</option>}
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.kind})
            </option>
          ))}
        </select>

        {/* Account dropdown (optional) */}
        <select
          className="select"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        >
          <option value="">No account</option>
          {accts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <button className="btn" disabled={saving}>
          {saving ? "Saving…" : "Add"}
        </button>
        {err && <div style={{ color: "tomato" }}>{err}</div>}
      </form>
    </Card>
  );
}
