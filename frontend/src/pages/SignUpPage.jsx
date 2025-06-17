import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, disguiseAndStoreToken } from "../AxiosSetup";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { GoogleLoginButton } from "../components/GoogleAuth";
const SignUpPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
      const response = await apiClient.post(`/auth/register`, form);

      const { accessToken, refreshToken, uid } = response.data;

      // Securely store tokens and UID
      disguiseAndStoreToken("access", accessToken);
      disguiseAndStoreToken("refresh", refreshToken);

      localStorage.setItem("gyid", uid);
      setUid(uid);

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setAuthenticated(true);

      // Show success message
      setSuccess(true);
    } catch (err) {
      console.error("Signup error:", err);

      setError(err.response?.data?.error || "Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Your Account
        </h2>

        {success ? (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-medium mb-2">
              Registration successful!
            </p>
            <p className="text-gray-600 mb-4">
              Please check your email to verify your account.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-red-500 text-center text-sm">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                Register
              </button>
            </form>
            <div className="mt-2">
              <GoogleLoginButton />
            </div>
          </>
        )}

        {!success && (
          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
