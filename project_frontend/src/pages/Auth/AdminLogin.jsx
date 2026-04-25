import { useState, useEffect } from "react";
import { Lock, User, Eye, EyeOff, Crown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminLoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true);
    setError("");
    const role = "admin";

    const result = await login(formData.username, formData.password, role);
    if (result.success) {
      navigate("/adminDashboard/admin-dashboard");
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  // Add event listener for Enter key
  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      if (
        e.key === "Enter" &&
        !isLoading &&
        formData.username &&
        formData.password
      ) {
        handleSubmit(e);
      }
    };

    document.addEventListener("keypress", handleGlobalKeyPress);
    return () => {
      document.removeEventListener("keypress", handleGlobalKeyPress);
    };
  }, [formData, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Geometric background patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-yellow-400 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-yellow-300 rotate-12 animate-bounce"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-20 animate-pulse"></div>
        </div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full -ml-12 -mb-12"></div>

          {/* Header */}
          <div className="text-center mb-10 relative">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl rotate-12 flex items-center justify-center mb-6 shadow-2xl relative">
              <Crown className="w-12 h-12 text-purple-900 -rotate-12" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-yellow-700/30 rounded-2xl"></div>
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 mb-2">
              ADMIN PORTAL
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-yellow-400 mx-auto mb-4 rounded-full"></div>
            <p className="text-white/80 text-lg font-medium">
              Secure administrative access
            </p>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-8">
              {/* Username Field */}
              <div className="relative">
                <label
                  htmlFor="username"
                  className="block text-sm font-bold text-yellow-300 mb-3 uppercase tracking-wider"
                >
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="h-6 w-6 text-yellow-400 group-focus-within:text-yellow-300 transition-colors" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="block w-full pl-14 pr-5 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 text-lg font-medium hover:bg-white/15"
                    placeholder="Enter admin username"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-focus-within:from-yellow-400/10 group-focus-within:via-yellow-400/5 group-focus-within:to-yellow-400/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-yellow-300 mb-3 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-6 w-6 text-yellow-400 group-focus-within:text-yellow-300 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-14 pr-14 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 text-lg font-medium hover:bg-white/15"
                    placeholder="Enter secure password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-5 flex items-center hover:scale-110 transition-transform duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6 text-yellow-400 hover:text-yellow-300" />
                    ) : (
                      <Eye className="h-6 w-6 text-yellow-400 hover:text-yellow-300" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-focus-within:from-yellow-400/10 group-focus-within:via-yellow-400/5 group-focus-within:to-yellow-400/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="relative">
                  <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 rounded-2xl p-5">
                    <p className="text-red-200 font-semibold text-center">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.username || !formData.password}
                className="w-full relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl transition-all duration-300 group-hover:from-yellow-500 group-hover:via-yellow-600 group-hover:to-yellow-700 group-disabled:from-gray-400 group-disabled:via-gray-500 group-disabled:to-gray-600"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative py-5 px-8 flex justify-center items-center">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-purple-900 mr-3"></div>
                      <span className="text-purple-900 font-black text-xl tracking-wide">
                        AUTHENTICATING...
                      </span>
                    </div>
                  ) : (
                    <span className="text-purple-900 font-black text-xl tracking-wide group-hover:scale-105 transition-transform duration-200">
                      ACCESS PORTAL
                    </span>
                  )}
                </div>
              </button>

              {/* Enter Key Hint */}
              <div className="text-center">
                <p className="text-white/60 text-sm font-medium">
                  Press{" "}
                  <kbd className="bg-white/20 text-white px-2 py-1 rounded text-xs font-mono">
                    Enter
                  </kbd>{" "}
                  to submit
                </p>
              </div>
            </div>
          </form>
          {/* Demo Credentials */}
          <div className="mt-10 relative">
            <div className="bg-gradient-to-r from-purple-800/30 via-purple-700/20 to-purple-800/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30">
              <div className="text-center">
                <p className="text-yellow-300 font-bold text-sm uppercase tracking-wider mb-3">
                  Demo Access
                </p>
                <div className="space-y-2">
                  <div className="flex justify-center items-center space-x-3">
                    <span className="text-white/70 font-medium">Username:</span>
                    <code className="bg-black/30 text-yellow-300 px-3 py-1 rounded-lg font-mono font-bold">
                      admin
                    </code>
                  </div>
                  <div className="flex justify-center items-center space-x-3">
                    <span className="text-white/70 font-medium">Password:</span>
                    <code className="bg-black/30 text-yellow-300 px-3 py-1 rounded-lg font-mono font-bold">
                      password123
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
