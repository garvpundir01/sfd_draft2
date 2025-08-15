import { useNavigate } from "react-router-dom";
import { logout } from "../auth";

export default function Header() {
  const nav = useNavigate();
  function handleSignOut() {
    logout();
    nav("/login", { replace: true });
  }
  return (
    <header className="header">
      <div className="kv">
        <strong>Smart Financial Dashboard</strong>
        <span>•</span>
        <span>v0.1</span>
      </div>
      <button className="btn btn-danger" onClick={handleSignOut}>Sign out</button>
    </header>
  );
}
