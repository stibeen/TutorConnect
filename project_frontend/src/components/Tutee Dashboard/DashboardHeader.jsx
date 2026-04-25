import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardHeader({ onToggleSidebar }) {
  const { user } = useAuth();
  const name = user.name;
  const pathToTitle = {
    "/dashboard": "Tutee Dashboard",
    "/dashboard/overview": "Tutee Dashboard",
    "/dashboard/my-sessions": "My Sessions",
    "/dashboard/find-tutor": "Find Tutor",
    "/dashboard/notifications": "Notifications",
    "/dashboard/settings": "Settings",
  };
  const pathToSubtitle = {
    "/dashboard": `Welcome back, ${name}! Ready to continue learning?`,
    "/dashboard/overview": `Welcome back, ${name}! Ready to continue learning?`,
    "/dashboard/my-sessions": `Manage your booked tutoring sessions`,
    "/dashboard/find-tutor": `Browse and connect with expert tutors in your subjects`,
    "/dashboard/notifications":
      "Stay updated with the latest activity and session alerts",
    "/dashboard/settings":
      "Manage your account preferences and application settings",
  };
  const location = useLocation();
  let title = pathToTitle[location.pathname] || "Tutee Dashboard";
  const subtitle = pathToSubtitle[location.pathname] || "";

  if(location.pathname.includes('/tutor-profile')){
    title = 'Tutor Profile';
  }
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
}
