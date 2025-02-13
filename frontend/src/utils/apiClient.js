import axios from "axios";
import { toast } from "react-toastify";

// Create Axios instance with a base URL
const apiClient = axios.create({
  baseURL: "http://localhost:5006/api",
  headers: { "Content-Type": "application/json" },
});

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to handle failed requests while refreshing token
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available");

          const response = await axios.post("http://localhost:5006/api/auth/refresh-token", {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // ✅ Store new tokens
          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          isRefreshing = false;
          onRefreshed(accessToken);
        } catch (refreshError) {
          isRefreshing = false;
          logoutUser();
        }
      }

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

// ✅ Logout function to clear storage & redirect
const logoutUser = () => {
  toast.error("Session expired. Please log in again.");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/"; // Redirect to login page
};

export default apiClient;
