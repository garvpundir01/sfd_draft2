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
      });
      setEditing(false);
      onChanged?.(); // tell parent to refresh everything
    } catch (e) {
      console.error(e);
      alert("Failed to update transaction");
    }
  }

  async function remove() {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(tx.id);
      onChanged?.(); // tell parent to refresh everything
    } catch (e) {
      console.error(e);
      alert("Failed to delete transaction");
    }
  }

  if (editing) {
    return (
      <tr>
        <td><input className="select" value={desc} onChange={(e)=>setDesc(e.target.value)} /></td>
        <td><input className="select" type="number" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} /></td>
        <td><input className="select" type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></td>
        <td colSpan={2} />
        <td style={{whiteSpace:"nowrap"}}>
          <button className="btn" onClick={save}>Save</button>
          <button className="btn" onClick={()=>{ setEditing(false); setDesc(tx.description||""); setAmount(String(tx.amount)); setDate(tx.occurred_at); }} style={{marginLeft:6}}>Cancel</button>
        </td>
      </tr>
    );
  }

  const isNeg = Number(tx.amount) < 0;

  return (
    <tr>
      <td>{tx.description}</td>
      <td style={{ color: isNeg ? "#ff7676" : "#4ce087" }}>
        {isNeg ? "-" : ""}{Math.abs(Number(tx.amount)).toLocaleString()}
      </td>
      <td>{tx.occurred_at}</td>
      <td>{tx.category || "—"}</td>
      <td>{tx.account || "—"}</td>
      <td style={{whiteSpace:"nowrap"}}>
        <button className="btn" onClick={()=>setEditing(true)}>Edit</button>
        <button className="btn btn-danger" onClick={remove} style={{marginLeft:6}}>Delete</button>
      </td>
    </tr>
  );
}

export default function TransactionsList({ refreshSignal, onChanged }) {
  const [rows, setRows] = useState([]);

  async function load() {
    try {
      const data = await listTransactions();
      setRows(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { load(); }, [refreshSignal]);

  return (
    <Card title="Recent Transactions">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ textAlign: "left", opacity: 0.8 }}>
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
            {rows.map((tx) => (
              <Row key={tx.id} tx={tx} onChanged={onChanged} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
