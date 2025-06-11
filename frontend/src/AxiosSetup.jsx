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
  // const encodedUid = localStorage.getItem("gyid");
  // return encodedUid ? encodedUid : null;
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

// Request interceptor
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
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is in progress, queue the request
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
        const response = await apiClient.post("/auth/refresh-token", {
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
        await logoutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Export everything needed
export {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  getUid,
  disguiseAndStoreToken,
  retrieveAndAssembleToken,
  apiClient,
};
