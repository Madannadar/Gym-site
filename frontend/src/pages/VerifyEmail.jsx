import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiClient } from "../AxiosSetup";
import { CheckCircle, XCircle, RefreshCcw } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState("");

  const verify = async () => {
    if (!token) {
      setError("Verification token missing.");
      setVerified(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await apiClient.post(`/auth/verify-email`, { token });
      setVerified(true);
      setLoading(false);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Email verification failed.");
      setVerified(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-lg text-gray-700 font-semibold">
              Verifying your email...
            </h2>
          </>
        ) : verified ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-green-600">
              Email Verified!
            </h2>
            <p className="text-gray-600 mt-2">Redirecting to the homepage...</p>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-red-600">
              Verification Failed
            </h2>
            <p className="text-gray-700 mt-2">{error}</p>
            <button
              onClick={verify}
              className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              <RefreshCcw className="w-4 h-4" /> Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
