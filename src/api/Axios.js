import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000,
  withCredentials: true, // Required if backend uses HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// ==========================
// Request Interceptor
// ==========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("payo_token");

    // Add Authorization header only if access token exists
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// Response Interceptor
// ==========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network Error");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    console.group("API ERROR");
    console.log("Status :", status);
    console.log("Method :", error.config?.method?.toUpperCase());
    console.log("URL    :", error.config?.url);
    console.log("Response :", data);
    console.groupEnd();

    switch (status) {
      case 400:
        console.warn("400 - Bad Request");
        break;

      case 401:
        console.warn("401 - Unauthorized");
        // Optional:
        // localStorage.removeItem("payo_token");
        break;

      case 403:
        console.warn("403 - Forbidden");
        break;

      case 404:
        console.warn("404 - Not Found");
        break;

      case 500:
        console.warn("500 - Internal Server Error");
        break;

      default:
        console.warn(`Unexpected Error (${status})`);
    }

    return Promise.reject(error);
  }
);

export default api;