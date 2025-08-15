export default function CategoryBadge({ name, kind }) {
  const k = (kind || "").toLowerCase();
  return (
    <span className={`badge ${k === "expense" ? "expense" : "income"}`}>
      <span style={{opacity:.8}}>{k === "expense" ? "−" : "+"}</span>
      <strong>{name}</strong>
    </span>
  );
}
