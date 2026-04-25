import React from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TutorDashboardHeader = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const name = user.name;
  const pathToTitle = {
    "/dashboardTutor": "Tutor Dashboard",
    "/dashboardTutor/tutor-home": "Tutor Dashboard",
    "/dashboardTutor/tutor-sessions": "Sessions",
    "/dashboardTutor/tutor-manage-schedule": "Manage Schedule",
    "/dashboardTutor/tutor-notifications": "Notifications",
    "/dashboardTutor/tutor-settings": "Settings",
  };
  const pathToSubtitle = {
    "/dashboardTutor": `Welcome back, ${name}! Ready to teach?`,
    "/dashboardTutor/tutor-home": `Welcome back, ${name}! Ready to teach?`,
    "/dashboardTutor/tutor-sessions": "Manage your tutoring sessions",
    "/dashboardTutor/tutor-manage-schedule": "Set your availability and manage your tutoring schedule",
    "/dashboardTutor/tutor-notifications": "Stay updated with the latest activity and session alerts",
    "/dashboardTutor/tutor-settings": "Manage your account preferences and application settings",
  };
  const location = useLocation();
  const title = pathToTitle[location.pathname] || "Tutor Dashboard";
  const subtitle = pathToSubtitle[location.pathname] || "";

  return (
    <header className="flex items-center border-b border-gray-500">
      {/* Always visible burger icon */}
      <button
        className="p-2 rounded-full text-[#3b2762] hover:bg-[#efc94033] hover:text-[#efc940] transition-all duration-200 hover:scale-110 hover:cursor-pointer"
        onClick={onToggleSidebar}
      >
        <Menu size={28} />
      </button>

      <div>
        <h1 className="text-3xl font-bold text-[#3b2762] ml-3">{title}</h1>
        <h2 className="ml-3">{subtitle}</h2>
      </div>
    </header>
  );
};

export default TutorDashboardHeader;
