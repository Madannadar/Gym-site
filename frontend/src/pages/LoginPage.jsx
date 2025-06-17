import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../AxiosSetup";
import { disguiseAndStoreToken } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { setUid, setAccessToken, setRefreshToken, setAuthenticated } =
    useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiClient.post(`/auth/login`, form);

      const { accessToken, refreshToken, uid, user } = res.data;
      console.log(res.data);
      if (!accessToken || !refreshToken || !uid) {
        throw new Error("Missing tokens or user ID in response");
      }
      disguiseAndStoreToken("access", accessToken);
      disguiseAndStoreToken("refresh", refreshToken);
      // const dis_uid = btoa(uid);
      localStorage.setItem("gyid", uid); // base64 encode UID
      setUid(uid);
      // console.log(uid, "done");

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setAuthenticated(true);

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");

      console.error("🔍 Login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Log In
          </button>

          <div className="flex justify-between items-center text-sm mt-3">
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:underline"
            >
              Forgot Password?
            </Link>
            <Link to="/signup" className="text-indigo-600 hover:underline">
              Don’t have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
