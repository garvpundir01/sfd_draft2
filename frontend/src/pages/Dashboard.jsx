// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api";

import Card from "../components/Card";
import BudgetProgress from "../components/BudgetProgress";
import ExpenseChart from "../components/ExpenseChart";
import IncomeSummary from "../components/IncomeSummary";
import MonthlyBarChart from "../components/MonthlyBarChart";
import AddCategoryForm from "../components/AddCategoryForm";
import AddTransactionForm from "../components/AddTransactionForm";
import AddBudgetForm from "../components/AddBudgetForm";

import CategoryRow from "../components/CategoryRow";
import TransactionsList from "../components/TransactionsList";
import BudgetsList from "../components/BudgetsList";

export default function Dashboard() {
  const today = new Date();

  // Filters
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  // Data
  const [cats, setCats] = useState([]);
  const [summary, setSummary] = useState(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Forces child widgets to re-fetch (IncomeSummary, TransactionsList, BudgetsList)
  const [refreshTick, setRefreshTick] = useState(0);
  const bump = () => setRefreshTick((n) => n + 1);

  const years = useMemo(() => {
    const y = today.getFullYear();
    return [y - 2, y - 1, y, y + 1];
  }, [today]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  // ---- Fetchers ------------------------------------------------------------
  async function refreshAll(y = year, m = month) {
    const [cRes, sRes] = await Promise.all([
      api.get("/api/finance/categories/"),
      api.get(`/api/finance/summary/?year=${y}&month=${m}`),
    ]);
    setCats(cRes.data || []);
    setSummary(sRes.data || {});
  }

  // Initial + when filters change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        await refreshAll();
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("Failed to fetch data. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // When anything changes in children (add/edit/delete), refresh + tick
  const onAnyChange = async () => {
    await refreshAll();
    bump();                     // <- makes IncomeSummary & TransactionsList refetch immediately
  };

  // Convenience manual refresh button
  const manualRefresh = async () => {
    await refreshAll();
    bump();
  };

  // -------------------------------------------------------------------------

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 40px" }}>
      <h2 className="section-title" style={{ marginTop: 12 }}>Dashboard</h2>

      {/* Filters */}
      <div className="controls" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span className="kv">Time range:</span>
        <select
          className="select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          className="select"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {months.map((m) => (
            <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
          ))}
        </select>
        <button className="btn" onClick={manualRefresh}>Refresh</button>
      </div>

      {loading && <Card><div>Loading…</div></Card>}
      {err && <Card><div style={{ color: "tomato" }}>{err}</div></Card>}

      {!loading && !err && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* LEFT SIDEBAR */}
          <div style={{ display: "grid", gap: 16 }}>
            <Card title="Quick Add">
              <div style={{ display: "grid", gap: 12 }}>
                <AddCategoryForm onCreated={onAnyChange} />
                <AddTransactionForm cats={cats} onCreated={onAnyChange} />
                <AddBudgetForm cats={cats} onCreated={onAnyChange} />
              </div>
            </Card>

            <Card title="Categories">
              {cats.length ? (
                <ul className="list" style={{ listStyle: "none", paddingLeft: 0 }}>
                  {cats.map((c) => (
                    <CategoryRow
                      key={c.id}
                      cat={c}
                      onChanged={onAnyChange}
                      onDeleted={onAnyChange}
                    />
                  ))}
                </ul>
              ) : (
                <div style={{ opacity: 0.7 }}>No categories yet.</div>
              )}
            </Card>

            <Card title="Budget Progress">
              {(summary?.budget_progress ?? []).length ? (
                summary.budget_progress.map((b) => (
                  <BudgetProgress
                    key={b.category_id}
                    label={b.category_name}
                    limit={Number(b.limit || 0)}
                    spent={Number(b.spent || 0)}
                  />
                ))
              ) : (
                <div style={{ opacity: 0.7 }}>No budgets.</div>
              )}
            </Card>

            <BudgetsList
              cats={cats}
              refreshSignal={`${year}-${month}-${refreshTick}`}
              onChanged={onAnyChange}
            />

            <Card title="Raw summary data">
              <pre
                style={{
                  background: "#0f1218",
                  padding: 12,
                  borderRadius: 8,
                  overflow: "auto",
                  maxHeight: 320,
                }}
              >
                {JSON.stringify(summary, null, 2)}
              </pre>
            </Card>
          </div>

          {/* RIGHT CONTENT */}
          <div style={{ display: "grid", gap: 16 }}>
            <ExpenseChart
              byCategory={summary?.by_category ?? []}
              cats={cats}
            />

            {/* This version of IncomeSummary is minimal and refetches when refreshSignal changes */}
            <IncomeSummary
              year={year}
              month={month}
              summary={summary}
              refreshSignal={`${year}-${month}-${refreshTick}`}
            />

            <MonthlyBarChart byMonth={summary?.by_month ?? []} />

            <TransactionsList
              refreshSignal={`${year}-${month}-${refreshTick}`}
              onChanged={onAnyChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
