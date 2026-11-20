import { boot } from "quasar/wrappers";
import axios from "axios";
import { useAuthStore } from "stores/authStore";

const api = axios.create({
  baseURL: "http://192.168.8.182:4000/api",
    // baseURL: "http://192.168.100.188:7000/api",
  //  baseURL: "http://192.168.100.197:7000/api",
    //  baseURL: "http://192.168.8.182:4000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a 401 error
    if (error.response?.status === 401) {
      console.log("🔐 401 Unauthorized - Logging out...");

      const authStore = useAuthStore();

      // Clear everything
      authStore.logout();

      // Get router and redirect to login
      const router = globalThis.$router;
      if (router) {
        router.push({
          name: "login",
          query: {
            session: "expired",
            message: "Your session has expired. Please log in again.",
          },
        });
      }

      // Show notification if you have one
      Notify.create({
        message: "Session expired. Please login again.",
        type: "negative",
      });
    }

    return Promise.reject(error);
  }
);

export default boot(({ app, router }) => {
  // Make router available for interceptor
  globalThis.$router = router;

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
