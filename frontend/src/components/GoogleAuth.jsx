import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient, disguiseAndStoreToken } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

// Google Login Button Component
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 flex items-center gap-2"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
};

// Auth Callback Handler Component
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUid, setAccessToken, setRefreshToken, setAuthenticated } =
    useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const uid = params.get("uid");

    const user = {
      email: params.get("email"),
      firstName: params.get("firstName"),
      lastName: params.get("lastName"),
    };

    if (!accessToken || !refreshToken || !uid) {
      console.error("Missing tokens or uid in Google auth callback.");
      return navigate("/login");
    }

    // Debug logs
    console.log("Google Login Callback Params:", {
      accessToken,
      refreshToken,
      uid,
      user,
    });

    // Store tokens securely (obfuscated in localStorage)
    disguiseAndStoreToken("access", accessToken);
    disguiseAndStoreToken("refresh", refreshToken);
    localStorage.setItem("gyid", uid); // Store UID (optional: base64 encode)

    // Update Auth Context
    setUid(uid);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setAuthenticated(true);

    // Optional: Set default auth header for future requests
    // apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    navigate("/"); // Redirect after successful login
  }, [location]);

  return (
    <p className="text-center mt-10 text-lg">Logging you in via Google...</p>
  );
};

export { AuthCallback, GoogleLoginButton };
