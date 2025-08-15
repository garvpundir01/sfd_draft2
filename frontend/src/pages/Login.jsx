import { useState } from "react";
import { login } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(u, p);
      nav("/", { replace: true });
    } catch (e) {
      setErr("Invalid credentials or server error");
      console.error(e);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui" }}>
      <h2>Sign in</h2>
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={u} onChange={(e)=>setU(e.target.value)} required style={{width:"100%",margin:"6px 0"}} />
        <label>Password</label>
        <input type="password" value={p} onChange={(e)=>setP(e.target.value)} required style={{width:"100%",margin:"6px 0"}} />
        <button type="submit" style={{marginTop:10}}>Login</button>
      </form>
      {err && <p style={{color:"tomato"}}>{err}</p>}
      <p style={{opacity:.7, marginTop:8}}>Try demo/demo1234 if you loaded sample data.</p>
    </div>
  );
}
