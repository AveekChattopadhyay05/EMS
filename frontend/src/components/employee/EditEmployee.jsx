import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditEmployee() {
  const { id } = useParams(); 
  const [dept, setDept] = useState('');
  const [lead, setLead] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if at least one field is provided
    if (!dept.trim() && !lead.trim()) {
      setError("Please provide at least one field to update (Department or Lead)");
      return;
    }

    // Prepare the payload - only include non-empty fields
    const payload = { id };
    if (dept.trim()) payload.dept = dept.trim();
    if (lead.trim()) payload.lead = lead.trim();

    axios.post('http://localhost:5000/api/employee/update', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then((res) => {
      if (res.data.success) {
        console.log("Employee updated:", res.data);
        setSuccess(res.data.success);
        
        // Show what was updated
        const { updatedFields } = res.data;
        let updateMessage = "Updated: ";
        if (updatedFields.dept !== "unchanged") updateMessage += `Department to ${updatedFields.dept} `;
        if (updatedFields.lead !== "unchanged") updateMessage += `Lead to ${updatedFields.lead}`;
        
        setSuccess(`${res.data.success} - ${updateMessage}`);
        
        // Navigate after 2 seconds to show success message
        setTimeout(() => {
          navigate('/admin-dashboard/employees');
        }, 2000);
      }
    })
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Unexpected error occurred");
      }
    });
  };

  const handleReset = () => {
    setDept('');
    setLead('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {/* {success && <p className="text-green-500 mb-2">{success}</p>} */}
      
      <h2 className="text-2xl font-bold mb-6">Edit Employee</h2>
      
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
        <p className="text-sm">
          {/* 💡 <strong>Tip:</strong> You can update just the department, just the lead, or both. 
          Leave fields empty to keep them unchanged. */}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            New Department <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            placeholder="Leave empty to keep current department"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Lead <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            placeholder="Leave empty to keep current lead"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Update Employee
          </button>
          
          {/* <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-md transition-colors"
          >
            Reset
          </button> */}
        </div>
      </form>
    </div>
  );
}