import { Navigate } from "react-router-dom";
import { isAuthed } from "../auth";

export default function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}
