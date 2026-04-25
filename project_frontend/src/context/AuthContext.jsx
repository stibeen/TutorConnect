import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";

const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Verify token with backend
          const res = await axios.get(`${BASE_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Login function
  const login = async (email, password, role) => {
    try {
      const endpoint =
        role === "tutor"
          ? "/api/tutors/login"
          : role === "admin"
          ? "/api/admin/login"
          : "/api/users/login";
      const fullUrl = `${BASE_URL}${endpoint}`;

      const res = await axios.post(
        fullUrl,
        { email, password },
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // If you need to send cookies
        }
      );
      console.log("Login response:", res.data);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      // Update these paths to match what you expect in Login.jsx
      // navigate(
      //   role === "tutor"
      //     ? "/dashboardTutor/tutor-home"
      //     : role === "admin"
      //     ? "/adminDashboard/admin-dashboard"
      //     : "/dashboard/overview"
      // );
      return { success: true,
          userIsActive: res.data.user.isActive,
       };
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        console.error("Request timeout - backend not responding");
        return { success: false, error: "Server is not responding" };
      }
      if (!err.response) {
        console.error("Network error - no response from server");
        return { success: false, error: "Cannot connect to server" };
      }
      console.error("Login failed:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.error || err.message || "Login failed",
      };
    }
  };

  // Register function
  const register = async (formData, role) => {
    try {
      const endpoint =
        role === "tutor" ? "/api/tutors/registerTutor" : "/api/users/register";
      const res = await axios.post(`${BASE_URL}${endpoint}`, formData);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      // navigate(role === "tutor" ? "/tutor-dashboard" : "/");
      return { success: true };
    } catch (err) {
      console.error("Registration failed", err);
      return {
        success: false,
        error: err.response?.data?.error || "Registration failed",
      };
    }
  };

  // Logout function
  const logout = () => {
    // Get role before clearing state
    const role = user?.role;
    const targetPath = role === "admin" ? "/loginAdmin" : "/login";

    // Synchronous execution
    localStorage.removeItem("token");
    flushSync(() => {
      setUser(null);
    });

    navigate(targetPath);
  };
  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Check user role
  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
