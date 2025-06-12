import axios from "axios";
import logoutUser from "./LogOut";

function disguiseAndStoreToken(keyPrefix, token) {
  console.log(`🔍 Storing ${keyPrefix} token: ${token.slice(0, 10)}...`);
  localStorage.setItem(`${keyPrefix}_token`, token);
}

function retrieveAndAssembleToken(keyPrefix) {
  const token = localStorage.getItem(`${keyPrefix}_token`);
  console.log(`🔍 Retrieved ${keyPrefix} token: ${token ? token.slice(0, 10) + '...' : "None"}`);
  return token || null;
}

const getUid = () => {
  const encodedUid = localStorage.getItem("uid");
  const uid = encodedUid ? atob(encodedUid) : null;
  console.log(`🔍 UID: ${uid || "Missing"}`);
  return uid;
};

const getAccessToken = () => retrieveAndAssembleToken("access");
const getRefreshToken = () => retrieveAndAssembleToken("refresh");

const updateAccessToken = (newAccessToken) => {
  console.log("🔍 Updating Access Token");
  disguiseAndStoreToken("access", newAccessToken);
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api",
});

let isRefreshing = false;
let refreshSubscribers = [];

function onAccessTokenFetched(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log(`🔍 Request: ${config.method.toUpperCase()} ${config.url}`, {
    headers: {
      Authorization: token ? `Bearer ${token.slice(0, 10)}...` : "None",
      "Content-Type": config.headers["Content-Type"],
    },
    data: config.data,
  });
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`🔍 Response: ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error(`❌ Response Error: ${originalRequest?.method.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/diet-logs"
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            resolve(apiClient(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        console.log("🔍 Refreshing Token");
        const response = await apiClient.post("/api/auth/refresh-token", {
          token: refreshToken,
        });
        const newAccessToken = response.data.accessToken;
        updateAccessToken(newAccessToken);
        isRefreshing = false;
        onAccessTokenFetched(newAccessToken);
        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error("❌ Refresh Token Failed:", refreshError.response?.data || refreshError);
        await logoutUser();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  getUid,
  disguiseAndStoreToken,
  retrieveAndAssembleToken,
  apiClient,
};
