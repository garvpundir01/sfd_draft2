import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

/* -------------------- Categories -------------------- */
export const listCategories = () =>
  api.get("/api/finance/categories/").then((r) => r.data);

export const createCategory = (body) =>
  api.post("/api/finance/categories/", body).then((r) => r.data);

export const updateCategory = (id, body) =>
  api.patch(`/api/finance/categories/${id}/`, body).then((r) => r.data);

export const deleteCategory = (id) =>
  api.delete(`/api/finance/categories/${id}/`).then((r) => r.data);

/* -------------------- Accounts ---------------------- */
export const listAccounts = () =>
  api.get("/api/finance/accounts/").then((r) => r.data);

/* -------------------- Transactions ------------------ */
export const listTransactions = () =>
  api.get("/api/finance/transactions/").then((r) => r.data);

export const createTransaction = (body) =>
  api.post("/api/finance/transactions/", body).then((r) => r.data);

export const updateTransaction = (id, body) =>
  api.patch(`/api/finance/transactions/${id}/`, body).then((r) => r.data);

export const deleteTransaction = (id) =>
  api.delete(`/api/finance/transactions/${id}/`).then((r) => r.data);

/* -------------------- Budgets ----------------------- */
export const listBudgets = () =>
  api.get("/api/finance/budgets/").then((r) => r.data);

export const createBudget = (body) =>
  api.post("/api/finance/budgets/", body).then((r) => r.data);

export const updateBudget = (id, body) =>
  api.patch(`/api/finance/budgets/${id}/`, body).then((r) => r.data);

export const deleteBudget = (id) =>
  api.delete(`/api/finance/budgets/${id}/`).then((r) => r.data);
