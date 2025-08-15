import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function MonthlyBarChart({ byMonth }) {
  const data = useMemo(() => {
    if (!Array.isArray(byMonth)) return [];
    return byMonth.map(r => ({ month: r.month, total: Number(r.total || 0) }));
  }, [byMonth]);

  if (!data.length) return <div className="card">No monthly data.</div>;

  return (
    <div className="card">
      <h3>Net Total by Month</h3>
      <div style={{height:300}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="month" tick={{fontSize:12}} />
            <YAxis tick={{fontSize:12}} />
            <Tooltip formatter={(v)=>`$${Number(v).toLocaleString()}`} />
            <Bar dataKey="total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
