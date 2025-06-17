import React, { createContext, useContext, useState, useEffect } from "react";
import {
  apiClient,
  getAccessToken,
  getRefreshToken,
  getUid,
} from "./AxiosSetup";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [uid, setUid] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [authenticated, setAuthenticated] = useState(null);

  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const storedUid = getUid();
    const storedAccessToken = getAccessToken();
    const storedRefreshToken = getRefreshToken();
    //console.log(storedAccessToken);
    if (!storedUid || !storedAccessToken || !storedRefreshToken) {
      //console.log("setting false ");
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/auth/validate-tokens`);
      if (response.status === 200) {
        setUid(storedUid);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setAuthenticated(true);
        console.log(uid);
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

        checkAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
