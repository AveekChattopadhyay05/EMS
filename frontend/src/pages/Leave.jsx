
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/leaves/admin", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result) => {
        setLeaves(result.data);
        console.log("fetched leaves record", result.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching records", err);
        setLoading(false);
      });
  }, []);

  const filteredLeaves = leaves.filter((l) => {
    const typeMatch =
      filterType === "All" || l.leave_type === filterType;

    const statusMatch =
      filterStatus === "All" || l.status === filterStatus;

    return typeMatch && statusMatch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Admin Leave Records
      </h2>

      {loading && (
        <p className="mb-4 text-gray-600 animate-pulse">Loading...</p>
      )}

      {/* Status Summary */}
      <div className="flex gap-6 mb-6">
        <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow">
          Approved: {leaves.filter((l) => l.status === "Approved").length}
        </div>

        <div className="bg-red-100 text-red-800 px-6 py-3 rounded-lg shadow">
          Rejected: {leaves.filter((l) => l.status === "Rejected").length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-6 mb-6">

        {/* Leave Type Filter */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">
            Leave Type:
          </label>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Earned Leave">Earned Leave</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">
            Status:
          </label>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-teal-600 text-white uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Leave Type</th>
              <th className="px-6 py-4">From</th>
              <th className="px-6 py-4">To</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaves.map((emp) => (
              <tr
                key={emp.id}
                className="border-b hover:bg-gray-50 transition duration-200"
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {emp.id}
                </td>

                <td className="px-6 py-4">{emp.employee_name}</td>

                <td className="px-6 py-4">{emp.leave_type}</td>

                <td className="px-6 py-4">
                  {new Date(emp.start_date).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  {new Date(emp.end_date).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      emp.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

