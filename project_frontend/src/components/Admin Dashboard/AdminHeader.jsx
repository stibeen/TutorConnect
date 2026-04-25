import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function AdminHeader({ onToggleSidebar }) {
  const pathToTitle = {
    "/adminDashboard": "Admin Dashboard",
    "/adminDashboard/admin-dashboard": "Admin Dashboard",
    "/adminDashboard/admin-manage-users": "Manage Users",
    "/adminDashboard/admin-records": "Payment Records",
    "/adminDashboard/admin-settings": "System Settings",
  };
  const pathToSubtitle = {
    "/adminDashboard": "Overview of platform activity and user management.",
    "/adminDashboard/admin-dashboard": "Overview of platform activity and user management.",
    "/adminDashboard/admin-manage-users": "Manage platform users, roles, and access permissions.",
    "/adminDashboard/admin-records": "View and manage tutor payment records and transaction history.",
    "/adminDashboard/admin-settings": "Configure platform preferences, security, and notification settings.",
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
