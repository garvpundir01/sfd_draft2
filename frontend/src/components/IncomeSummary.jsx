import { useEffect, useMemo, useState } from "react";
import api from "../api";

/**
 * IncomeSummary
 * Props:
 *  - year: number (YYYY)
 *  - month: number (1..12)
 *  - summary: object (already fetched summary for current year/month)
 *  - refreshSignal: any (changes when user creates/edits/deletes a transaction)
 *
 * NOTE: This component is intentionally minimal and cannot duplicate
 * any outer layout. It renders only its own small panel.
 */
export default function IncomeSummary({ year, month, summary, refreshSignal }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---- Total income from summary (positive totals only) ----
  const totalIncome = useMemo(() => {
    const list = Array.isArray(summary?.by_category) ? summary.by_category : [];
    let sum = 0;
    for (const r of list) {
      // handle different serializer field names safely
      const raw =
        Number(r.total ?? r.sum ?? r.amount ?? r.value ?? 0) || 0;
      if (raw > 0) sum += raw;
    }
    return sum;
  }, [summary]);

  // ---- Fetch recent income transactions for this month ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // If your API supports year/month filters, use them here.
        // We’ll fetch all then filter client‑side to be safe.
        const resp = await api.get("/api/finance/transactions/");
        const all = Array.isArray(resp.data) ? resp.data : [];

        const monthKey = `${year}-${String(month).padStart(2, "0")}`;
        const incomeRows = all
          .filter((t) => {
            const date = String(t?.occurred_at || "");
            const isMonth = date.slice(0, 7) === monthKey;
            const isIncome = Number(t?.amount || 0) > 0;
            return isMonth && isIncome;
          })
          .sort((a, b) => {
            // newest first by date then id
            const ad = a.occurred_at ?? "";
            const bd = b.occurred_at ?? "";
            if (ad < bd) return 1;
            if (ad > bd) return -1;
            return (b.id || 0) - (a.id || 0);
          });

        if (!cancelled) setRows(incomeRows);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("Failed to load income.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year, month, refreshSignal]);

  const avgPaycheck = useMemo(() => {
    const n = rows.length || 1;
    return totalIncome / n;
  }, [totalIncome, rows.length]);

  return (
    <div
      style={{
        background: "#0f1218",
        border: "1px solid #1b2330",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 12 }}>
        Income Summary (this month)
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Total income" value={`$${totalIncome.toLocaleString()}`} />
        <Stat label="Paychecks" value={rows.length} />
        <Stat label="Avg per paycheck" value={`$${avgPaycheck.toFixed(2)}`} />
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Recent income</div>

        {loading && <div>Loading…</div>}
        {err && <div style={{ color: "tomato" }}>{err}</div>}

        {!loading && !err && (
          rows.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No income transactions this month.</div>
          ) : (
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "center" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 6).map((r) => (
                  <tr key={r.id}>
                    <td>{r.description || "(income)"}</td>
                    <td style={{ textAlign: "right", color: "#76e0c2" }}>
                      +${Number(r.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center" }}>{r.occurred_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#0b0f16",
        borderRadius: 8,
        padding: 12,
        border: "1px solid #1b2330",
      }}
    >
      <div style={{ opacity: 0.7, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}
