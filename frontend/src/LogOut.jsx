// src/components/LogOut.js
import { useNavigate } from "react-router-dom";

// Utility to clear all disguised parts of a token
const clearDisguisedToken = (keyPrefix) => {
  const length = parseInt(localStorage.getItem(`${keyPrefix}_len`));
  if (!length || isNaN(length)) return;

  for (let i = 0; i < length; i++) {
    localStorage.removeItem(`${keyPrefix}_part${i}`);
    localStorage.removeItem(`${keyPrefix}_noise${i}`);
  }

  localStorage.removeItem(`${keyPrefix}_len`);
};

// Logout function
const logoutUser = async () => {
  try {
    // Optional: if you want to notify server
    const refreshToken = localStorage.getItem("refresh_token_raw");
    if (refreshToken) {
      await fetch(`/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (err) {
    console.warn("Logout request failed or skipped:", err);
  }

  // Clear disguised tokens and uid
  clearDisguisedToken("access");
  clearDisguisedToken("refresh");

  localStorage.removeItem("gyid");
  localStorage.removeItem("refresh_token_raw"); // If stored separately

  // Redirect to login
  window.location.href = "/login";
};

export default logoutUser;
