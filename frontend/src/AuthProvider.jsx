import React, { createContext, useContext, useState, useEffect } from "react";
import {
  apiClient,
  getAccessToken,
  getRefreshToken,
  getUid,
} from "./AxiosSetup"; // Use updated token access methods

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [uid, setUid] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUid = getUid();
      const storedAccessToken = getAccessToken();
      const storedRefreshToken = getRefreshToken();

      if (!storedUid || !storedAccessToken || !storedRefreshToken) {
        setAuthenticated(false);
        return;
      }

      try {
        const response = await apiClient.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/validate-tokens`,
        );

        if (response.status === 200) {
          setUid(storedUid);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Error during token validation:", error);
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        uid,
        accessToken,
        refreshToken,
        authenticated,
        setUid,
        setAccessToken,
        setRefreshToken,
        setAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
