import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../../components/Tutee Dashboard/DashboardSidebar";
import DashboardHeader from "../../components/Tutee Dashboard/DashboardHeader";

export default function TuteeDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // sidebar is open by default

  useEffect(() => {
    const storedState = localStorage.getItem("sidebarOpen");
    if (storedState !== null) {
      setSidebarOpen(JSON.parse(storedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <DashboardSidebar isOpen={isSidebarOpen} />
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "16rem" : "4rem" }}
      >
        <div className="p-2">
          <DashboardHeader onToggleSidebar={toggleSidebar} />
        </div>

        <main className="flex-1 p-2">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}
