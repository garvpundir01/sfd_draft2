import { useEffect, useState } from "react";
import Card from "./Card";
import { listTransactions, updateTransaction, deleteTransaction } from "../api";

function Row({ tx, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(tx.description || "");
  const [amount, setAmount] = useState(String(tx.amount));
  const [date, setDate] = useState(tx.occurred_at);

  async function save() {
    try {
      await updateTransaction(tx.id, {
        description: desc,
        amount: Number(amount),
        occurred_at: date,
        // Note: category/account unchanged here; edit UI for those could be added later
        category: tx.category,
        account: tx.account,
      });
      setEditing(false);
      onChanged?.();
    } catch (e) {
      console.error(e);
      alert("Failed to save transaction");
    }
  }

  async function remove() {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(tx.id);
      onChanged?.();
    } catch (e) {
      console.error(e);
      alert("Failed to delete transaction");
    }
  }

  if (editing) {
    return (
      <tr>
        <td>
          <input
            className="select"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </td>
        <td>
          <input
            className="select"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </td>
        <td>
          <input
            className="select"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </td>
        <td>{tx.category_name ?? tx.category}</td>
        <td>{tx.account_name ?? "—"}</td>
        <td style={{ whiteSpace: "nowrap" }}>
          <button className="btn" onClick={save}>Save</button>
          <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
        </td>
      </tr>
    );
  }

  const amt = Number(tx.amount || 0);
  const isNeg = amt < 0;

  return (
    <tr>
      <td>{tx.description}</td>
      <td style={{ color: isNeg ? "#e76f6f" : "#34d399" }}>
        {isNeg ? "-" : ""}{Math.abs(amt)}
      </td>
      <td>{tx.occurred_at}</td>
      <td>{tx.category_name ?? tx.category}</td>
      <td>{tx.account_name ?? "—"}</td>
      <td style={{ whiteSpace: "nowrap" }}>
        <button className="btn" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn btn-danger" onClick={remove}>Delete</button>
      </td>
    </tr>
  );
}

export default function TransactionsList({ refreshSignal, onChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listTransactions();
      setRows(Array.isArray(data) ? data : data?.results ?? []);
    } catch (e) {
      console.error(e);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  return (
    <Card title="Recent Transactions">
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Category</th>
            <th>Account</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6}>Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={6}>No transactions yet.</td></tr>
          ) : (
            rows.map((tx) => (
              <Row key={tx.id} tx={tx} onChanged={() => { load(); onChanged?.(); }} />
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
