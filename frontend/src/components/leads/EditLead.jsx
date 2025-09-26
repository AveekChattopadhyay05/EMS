import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditLead() {
  const { email } = useParams();
  
  const navigate = useNavigate();

  const [lead, setLead] = useState({ name: "", email: "", password: "" });

  // Decode the email from the URL
  const decodedEmail = decodeURIComponent(email);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/lead/${decodedEmail}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setLead(res.data);
      })
      .catch((err) => {
        console.error("Error fetching lead:", err);
      });
  }, [decodedEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(
        `http://localhost:5000/api/lead/update/${decodedEmail}`,
        { ...lead },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        navigate("/admin-dashboard/leads");
      })
      .catch((err) => {
        console.error("Update failed:", err);
      });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6">Edit Lead</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Lead Name
          </label>
          <input
            type="text"
            value={lead.name}
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-gray-700">
            New Password (optional)
          </label>
          <input
            type="password"
            value={lead.password}
            onChange={(e) => setLead({ ...lead, password: e.target.value })}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md"
        >
          Update Lead
        </button>
      </form>
    </div>
  );
}
