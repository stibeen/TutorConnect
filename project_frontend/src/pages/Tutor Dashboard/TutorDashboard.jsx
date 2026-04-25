import React from 'react';
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import TutorDashboardSidebar from "../../components/Tutor Dashboard/TutorDashboardSidebar";
import TutorDashboardHeader from "../../components/Tutor Dashboard/TutorDashboardHeader";

const TutorDashboard = () => {
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
      <TutorDashboardSidebar isOpen={isSidebarOpen} />
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "16rem" : "4rem" }}
      >
        <div className="p-2">
          <TutorDashboardHeader onToggleSidebar={toggleSidebar} />
        </div>

        <main className="flex-1 p-2">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}

export default TutorDashboard