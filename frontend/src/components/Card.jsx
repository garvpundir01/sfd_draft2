export default function Card({ title, right, children, style }) {
  return (
    <div className="card" style={style}>
      {(title || right) && (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h3>{title}</h3>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
