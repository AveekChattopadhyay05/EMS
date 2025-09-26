import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function LeadButtons({ lead, onDelete }) {
  const handleDeleteClick = () => {
  if (window.confirm("Are you sure you want to delete this lead?")) {
    onDelete(lead.email); // Just call parent function
  }
};
  return (
    <div className="flex gap-2">
      <Link
        to={`/admin-dashboard/edit-lead/${encodeURIComponent(lead.email)}`} // 👈 safe for special chars
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        Edit
      </Link>
      <button
        onClick={handleDeleteClick}
        className="px-3 py-1 bg-red-600 text-white rounded"
      >
        Delete
      </button>
    </div>
  );
}
