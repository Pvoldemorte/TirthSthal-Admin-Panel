const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5173/api";

const getToken = () => localStorage.getItem("admin_token");

// Generic JSON request helper
const request = async (path, { method = "GET", body, isFormData = false } = {}) => {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
};

// ── Auth ──
export const adminLogin = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password } });

export const getProfile = () => request("/auth/profile");

// ── Image upload (Cloudinary) ──
export const uploadImages = (files, folder = "tirthsthal") => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("images", file));
  formData.append("folder", folder);
  return request("/upload", { method: "POST", body: formData, isFormData: true });
};

// ── Temples ──
export const getTemples = (query = "") => request(`/temples${query}`);
export const getTemple = (slug) => request(`/temples/${slug}`);
export const createTemple = (payload) =>
  request("/temples", { method: "POST", body: payload });
export const updateTemple = (id, payload) =>
  request(`/temples/${id}`, { method: "PUT", body: payload });
export const deleteTemple = (id) =>
  request(`/temples/${id}`, { method: "DELETE" });

// ── Festivals ──
export const getFestivals = (query = "") => request(`/festivals${query}`);
export const createFestival = (payload) =>
  request("/festivals", { method: "POST", body: payload });
export const updateFestival = (id, payload) =>
  request(`/festivals/${id}`, { method: "PUT", body: payload });
export const deleteFestival = (id) =>
  request(`/festivals/${id}`, { method: "DELETE" });

// ── Deities ──
// export const getDeities    = ()        => request("/deities");
// export const createDeity   = (payload) => request("/deities",     { method: "POST",   body: payload });
// export const updateDeity   = (id, payload) => request(`/deities/${id}`, { method: "PUT", body: payload });
// export const deleteDeity   = (id)      => request(`/deities/${id}`, { method: "DELETE" });

export default request;
