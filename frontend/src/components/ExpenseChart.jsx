import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// oranges/reds for expenses
const COLORS = ["#ff9aa2", "#f8c572", "#ffb86b", "#ff7c7c", "#ffcf9f", "#ffaeae", "#ffd9a0"];
const pick = (i) => COLORS[i % COLORS.length];

const num = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

function getId(row) {
  // Most APIs use category_id, some use category
  const v = row.category_id ?? row.category ?? row.id;
  const n = num(v);
  return Number.isNaN(n) ? null : n;
}

function getRawValue(row) {
  // accept total / sum / amount / value
  return Number(row.total ?? row.sum ?? row.amount ?? row.value ?? 0) || 0;
}

export default function ExpenseChart({ byCategory = [], cats = [] }) {
  // Build lookup tables from categories
  const { kindById, nameById } = useMemo(() => {
    const k = new Map();
    const n = new Map();
    for (const c of cats) {
      const id = num(c.id);
      if (id === null) continue;
      k.set(id, (c.kind || "").toUpperCase());
      n.set(id, c.name || "");
    }
    return { kindById: k, nameById: n };
  }, [cats]);

  const rows = useMemo(() => {
    const out = [];
    for (const r of Array.isArray(byCategory) ? byCategory : []) {
      const id = getId(r);
      const raw = getRawValue(r);

      // prefer official kind, otherwise infer by sign (negatives are expenses)
      const k = (kindById.get(id) || (raw < 0 ? "EXPENSE" : "INCOME")).toUpperCase();
      if (k !== "EXPENSE") continue;

      // Try all possible name fields, then fallback to nameById, then placeholder
      const nameFromRow =
        r.category__name ?? r.category_name ?? r.name ?? r.label ?? null;
      const name = nameFromRow || nameById.get(id) || `Category ${id ?? ""}`.trim();

      const value = Math.abs(raw);
      if (value > 0) out.push({ id, name, value });
    }
    return out;
  }, [byCategory, kindById, nameById]);

  const total = rows.reduce((s, x) => s + x.value, 0);
  const ready = total > 0;
  const data = rows.map((d) => ({ ...d, percent: (d.value / total) * 100 }));

  return (
    <div className="card">
      <div className="card-title">Expense Breakdown by Category</div>

      {!ready ? (
        <div style={{ opacity: 0.7, padding: 12 }}>No expenses recorded for this period.</div>
      ) : (
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={90}
                outerRadius={130}
                paddingAngle={1}
                stroke="#0f1218"
                strokeWidth={2}
              >
                {data.map((d, i) => (
                  <Cell key={d.id ?? i} fill={pick(i)} />
                ))}
              </Pie>

              <Tooltip
                formatter={(val, name, props) => {
                  const pct = props?.payload?.percent ?? 0;
                  return [`$${Number(val).toLocaleString()} (${pct.toFixed(1)}% of expenses)`, name];
                }}
              />
              <Legend
                formatter={(value, entry, index) => {
                  const item = data[index];
                  return `${value} (${(item?.percent ?? 0).toFixed(0)}%)`;
                }}
                iconType="square"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {ready && (
        <div style={{ padding: "4px 12px 12px", fontSize: 12, opacity: 0.7 }}>
          Percentages are out of total <strong>expenses</strong> in this period.
        </div>
      )}
    </div>
  );
}
