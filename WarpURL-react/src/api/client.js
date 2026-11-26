import axios from "axios";
import toast from "react-hot-toast";

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

/* ── Response: handle 401 & 429 ──────────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("warpurl_token");
      localStorage.removeItem("warpurl_user");
      window.location.href = "/auth";
    } else if (status === 429) {
      const retryAfter =
        error.response.headers?.["retry-after"] ||
        error.response.data?.retryAfterSeconds ||
        60;
      const baseMsg = error.response.data?.message || "Rate limit exceeded.";
      const rateLimitMsg = `${baseMsg} Try again in ${retryAfter}s.`;
      error.isRateLimited = true;
      error.retryAfterSeconds = Number(retryAfter);
      error.response.data = {
        ...(error.response.data || {}),
        message: rateLimitMsg,
      };
      toast.error(rateLimitMsg, {
        id: "warp-rate-limit",
        icon: "⏳",
        duration: 5000,
      });
    }
    return Promise.reject(error);
  }
);

/* ── Auth ────────────────────────────────────────────────────── */
export const authAPI = {
  register:  (data) => api.post("/api/auth/public/register", data),
  login:     (data) => api.post("/api/auth/public/login", data),
  demoLogin: ()     => api.post("/api/auth/public/demo-login"),
};

/* ── URLs ────────────────────────────────────────────────────── */
export const urlAPI = {
  shorten:      (originalUrl, customAlias)      => api.post("/api/urls/shorten", { originalUrl, customAlias }),
  getMyUrls:    ()                               => api.get("/api/urls/myurls"),
  getAnalytics: (shortCode, startDate, endDate) =>
    api.get(`/api/urls/analytics/${shortCode}`, { params: { startDate, endDate } }),
};

export default api;
