import api from "./api";

export async function login(username, password) {
  const { data } = await api.post("/api/token/", { username, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export function isAuthed() {
  return !!localStorage.getItem("access");
}
