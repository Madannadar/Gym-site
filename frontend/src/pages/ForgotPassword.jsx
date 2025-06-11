import React, { useState } from "react";
import { apiClient } from "../AxiosSetup";
import { MailCheck, MailWarning, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/request-password-reset`,
        { email },
      );
      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Forgot Password
        </h2>

        {error && (
          <div className="flex items-center text-red-600 justify-center mb-4 gap-2">
            <MailWarning className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center">
            <MailCheck className="w-10 h-10 text-green-600 mb-2" />
            <p className="text-green-600 font-medium">
              Password reset link sent successfully!
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Please check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="text-left">
              <label className="block mb-1 text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white bg-indigo-600 transition duration-200 ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-indigo-700"
              } flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
