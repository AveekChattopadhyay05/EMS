import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddEmployee() {
  const [empName, setEmpName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [deptName, setDeptName] = useState('');
  const [reptTo, setReptTo] = useState('');
  const [reptToId,setReptToId]=useState()
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(
      "http://localhost:5000/api/employee/add",
      { empName, email, dob, deptName, reptTo,reptToId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((result) => {
        if (result.data.success) {
          navigate("/admin-dashboard/employees");
          console.log("Employee added successfully");
        } else if (result.data.error) {
          setError(result.data.error);
        }
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error) {
          setError(error.response.data.error);  // handles backend "department not exist" error
        } else {
          setError("Unexpected error occurred");
        }
      });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <h2 className="text-2xl font-bold mb-6">Add New Employee</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="emp_name" className="text-sm font-medium text-gray-700">
              Employee Name
            </label>
            <input
              onChange={(e) => setEmpName(e.target.value)}
              type="text"
              name="emp_name"
              placeholder="Employee Name"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              placeholder="Email"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">DOB</label>
            <input
              onChange={(e) => setDob(e.target.value)}
              type="date"
              name="dob"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Department</label>
            <input
              onChange={(e) => setDeptName(e.target.value)}
              type="text"
              name="dep_name"
              placeholder="Department Name"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Lead</label>
            <input
              onChange={(e) => setReptTo(e.target.value)}
              type="text"
              name="lead_name"
              placeholder="Lead Name"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <label className="text-sm font-medium text-gray-700">Lead ID</label>
            <input
              onChange={(e) => setReptToId(e.target.value)}
              type="number"
              name="lead_id"
              placeholder="Lead ID"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Add Employee
          </button>
        </form>
      </div>
    </>
  );
}
