import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/* ── Request: attach JWT ─────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("warpurl_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response: handle 401 ────────────────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("warpurl_token");
      localStorage.removeItem("warpurl_user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

/* ── Auth ────────────────────────────────────────────────────── */
export const authAPI = {
  register: (data) => api.post("/api/auth/public/register", data),
  login:    (data) => api.post("/api/auth/public/login", data),
};

/* ── URLs ────────────────────────────────────────────────────── */
export const urlAPI = {
  shorten:      (originalUrl)                   => api.post("/api/urls/shorten", { originalUrl }),
  getMyUrls:    ()                               => api.get("/api/urls/myurls"),
  getAnalytics: (shortCode, startDate, endDate) =>
    api.get(`/api/urls/analytics/${shortCode}`, { params: { startDate, endDate } }),
};

export default api;
