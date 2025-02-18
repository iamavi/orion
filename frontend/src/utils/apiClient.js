import axios from "axios";
import { toast } from "react-toastify";

// ✅ Create Axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:5006/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ Ensures cookies (JWT + CSRF) are sent automatically
});

// ✅ Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

// ✅ Function to execute all pending requests after token refresh
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// ✅ Add response interceptor to handle token expiration & auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // ✅ Send request to refresh token using cookies
          const response = await apiClient.post("/auth/refresh-token");
          isRefreshing = false;
          onRefreshed(response.data.accessToken);
        } catch (refreshError) {
          isRefreshing = false;
          logoutUser();
        }
      }

      // ✅ Queue failed requests until refresh is complete
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// ✅ Auto-fetch CSRF token for added security
const fetchCsrfToken = async () => {
  try {
    const response = await apiClient.get("/csrf-token");
    apiClient.defaults.headers.common["X-CSRF-Token"] = response.data.csrfToken;
    console.log("CSRF Token Set:", response.data.csrfToken); // ✅ Debugging
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
  }
};

// ✅ Logout function to clear session & redirect
const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout failed:", error);
  }
  toast.error("Session expired. Please log in again.");
  localStorage.removeItem("user");
  window.location.href = "/";
};

// ✅ Call CSRF fetch on app start
fetchCsrfToken();

export { fetchCsrfToken, logoutUser };
export default apiClient;
