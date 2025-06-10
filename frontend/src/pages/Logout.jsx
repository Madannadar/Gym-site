import { useEffect } from "react";
import logoutUser from "../LogOut";
import { LogOut, Loader2 } from "lucide-react";

const Logout = () => {
  useEffect(() => {
    logoutUser(); // Trigger logout on mount
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-sm w-full text-center">
        <div className="flex justify-center items-center mb-4">
          <LogOut className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Logging you out...
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Please wait while we securely end your session.
        </p>
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    </div>
  );
};

export default Logout;
