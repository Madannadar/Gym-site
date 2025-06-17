import axios from "axios";
import logoutUser from "./LogOut";

// Utility: disguise and store token in multiple encoded parts
function disguiseAndStoreToken(keyPrefix, token) {
  const reversed = token.split("").reverse().join("");
  const chunks = reversed.match(/.{1,5}/g); // split into 5-char chunks

  chunks.forEach((chunk, index) => {
    const encodedChunk = btoa(chunk);
    const noise = btoa(`x${Math.random().toString(36).substring(2, 6)}x`);
    localStorage.setItem(`${keyPrefix}_part${index}`, encodedChunk);
    localStorage.setItem(`${keyPrefix}_noise${index}`, noise); // add dummy data
  });

  localStorage.setItem(`${keyPrefix}_len`, chunks.length); // total parts stored
}

// Utility: reassemble and retrieve the original token
function retrieveAndAssembleToken(keyPrefix) {
  const length = parseInt(localStorage.getItem(`${keyPrefix}_len`));
  if (!length || isNaN(length)) return null;

  let token = "";
  for (let i = 0; i < length; i++) {
    const part = localStorage.getItem(`${keyPrefix}_part${i}`);
    if (!part) return null;
    token += atob(part);
  }

  return token.split("").reverse().join("");
}

// Accessor for UID (already base64-encoded in localStorage)
const getUid = () => {
  return localStorage.getItem("gyid");
};

// Accessor for tokens
const getAccessToken = () => retrieveAndAssembleToken("access");
const getRefreshToken = () => retrieveAndAssembleToken("refresh");

// Store access token
const updateAccessToken = (newAccessToken) => {
  disguiseAndStoreToken("access", newAccessToken);
};

// Axios instance
const apiClient = axios.create();

// Token refresh queue management
let isRefreshing = false;
let refreshSubscribers = [];

function onAccessTokenFetched(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Request interceptor
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Response: ${response.config.method.toUpperCase()} ${response.config.url}`,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      `❌ Response Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
      {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      }
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/diet-logs"
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = "Bearer " + newToken;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        console.log("🔁 Refreshing access token...");

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
        console.error("❌ Refresh token failed:", refreshError.response?.data || refreshError);
        await logoutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Exports
export {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  getUid,
  disguiseAndStoreToken,
  retrieveAndAssembleToken,
  apiClient,
};
