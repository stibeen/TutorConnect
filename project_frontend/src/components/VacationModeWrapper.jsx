import { useState, useEffect } from "react";
import VacationPage from "./VacationPage";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Import your auth context

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Routes that should be accessible even during vacation mode
const EXCLUDED_ROUTES = [
  "/loginAdmin",
  "/adminDashboard/admin-dashboard",
  "/adminDashboard/admin-dashboard", // You might need to adjust based on your actual routes
  "/adminDashboard/admin-manage-users",
  "/adminDashboard/admin-records",
  "/adminDashboard/admin-settings",
];

const VacationModeWrapper = ({ children }) => {
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get current user

  useEffect(() => {
    const checkVacationMode = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/academic-calendar/vacation-mode`
        );
        setIsVacationMode(response.data.isVacationMode);
      } catch (error) {
        console.error("Error checking vacation mode:", error);
        setIsVacationMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkVacationMode();

    const interval = setInterval(checkVacationMode, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if current route is excluded from vacation mode
  const isExcludedRoute = EXCLUDED_ROUTES.some((route) => {
    if (route.endsWith("/*")) {
      const baseRoute = route.replace("/*", "");
      return location.pathname.startsWith(baseRoute);
    }
    return location.pathname === route;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking platform status...</p>
        </div>
      </div>
    );
  }

  // Don't show vacation page for excluded routes
  if (isVacationMode && !isExcludedRoute) {
    return <VacationPage />;
  }

  return children;
};

export default VacationModeWrapper;
