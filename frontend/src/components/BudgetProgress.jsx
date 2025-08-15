export default function BudgetProgress({ label, limit=0, spent=0 }) {
  const pct = Math.min(100, Math.round((spent / (limit || 1)) * 100));
  const over = spent > limit;
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
        <span>{label}</span>
        <span style={{opacity:.8}}>
          ${Number(spent).toLocaleString()} / ${Number(limit).toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className={`progress ${over ? 'over' : ''}`}>
        <span style={{width:`${pct}%`}} />
      </div>
    </div>
  );
}
