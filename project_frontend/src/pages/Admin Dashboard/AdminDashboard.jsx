import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/Admin Dashboard/AdminSidebar";
import AdminHeader from "../../components/Admin Dashboard/AdminHeader";

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
      <AdminSidebar isOpen={isSidebarOpen} />
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "16rem" : "4rem" }}
      >
        <div className="p-2">
          <AdminHeader onToggleSidebar={toggleSidebar} />
        </div>

        <main className="flex-1 p-7">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}
