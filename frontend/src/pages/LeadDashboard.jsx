import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/dashboard/Navbar";
import LeadSidebar from "../components/dashboard/LeadSidebar";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

export default function LeadDashbooard() {
  const { user } = useAuth();

  return (
    <div className="flex">
      <LeadSidebar />

      <div className="flex-1 ml-64 bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6">

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-5 mb-6">

            <FaUserCircle className="text-6xl text-gray-500" />

            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {user.name}
              </h1>

              <p className="text-gray-600">{user.email}</p>

              <p className="text-sm text-gray-400 mt-1">
                Lead Dashboard
              </p>
            </div>

          </div>

          {/* Page Content */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
}