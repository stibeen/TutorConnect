import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ isOpen }) {
  const { logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // const handleLogout = () => {
  //   const role = logout();
  //   setTimeout(() => {
  //     navigate(role === "admin" ? "/loginAdmin" : "/login");
  //   }, 100);
  // };

  const handleLogout = async () => {
    await logout();
  };

  const expanded = isOpen || hovered;
  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 bg-[#3b2762] text-white transition-all duration-300 ease-in-out ${
        expanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4">
        {expanded && <h1 className="text-xl font-bold">TutorConnect</h1>}
      </div>

      <nav className="space-y-4 px-2">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          to="admin-dashboard"
          expanded={expanded}
        />
        <SidebarItem
          icon={<Users size={20} />}
          label="Manage Users"
          to="admin-manage-users"
          expanded={expanded}
        />
        <SidebarItem
          icon={<CreditCard size={20} />}
          label="Payment Records"
          to="admin-records"
          expanded={expanded}
        />
        <SidebarItem
          icon={<Settings size={20} />}
          label="System Settings"
          to="admin-settings"
          expanded={expanded}
        />
        <AlertDialog
          open={isLogoutDialogOpen}
          onOpenChange={setIsLogoutDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <div className="w-full">
              <button
                className={`
                          flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer w-full
                          hover:bg-[#efc94033] transition-all
                        `}
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                <span className="text-white">
                  <LogOut size={20} />
                </span>
                {expanded && (
                  <span className="text-white transition-opacity duration-300">
                    Logout
                  </span>
                )}
              </button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-[#3b2762] hover:bg-[#513687] hover:cursor-pointer"
              >
                Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, to, expanded, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={({ isActive }) => `
        flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer
        hover:bg-[#efc94033] transition-all
        ${isActive ? "bg-[#efc94033] font-medium" : ""}
      `}
    >
      <span className="text-white">{icon}</span>
      {expanded && (
        <span className="text-white transition-opacity duration-300">
          {label}
        </span>
      )}
    </NavLink>
  );
}
