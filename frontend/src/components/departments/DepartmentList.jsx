import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DepartmentButtons from "../../utils/DepartmentHelp";

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/department/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result) => {
        setDepartments(result.data);
        setFilteredDepartments(result.data); 
        console.log("Successful fetching");
      })
      .catch((err) => {
        console.log("Error fetching departments: ", err);
      });
  }, []);

  const handleDelete = (deptName) => {
    const updated = departments.filter((dept) => dept.dept_name !== deptName);
    setDepartments(updated);
    setFilteredDepartments(updated); 
  };

  const filterDepartments = (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = departments.filter((dep) =>
      dep.dept_name.toLowerCase().includes(keyword)
    );
    setFilteredDepartments(filtered);
  };

  return (
    <>
      <div className="p-5">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Manage Departments</h3>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <input
          onChange={filterDepartments}
          type="text"
          placeholder="Search By Dept Name"
          className="px-4 py-0.5 border"
        />
        <Link
          to="/admin-dashboard/add-department"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add New Department
        </Link>
      </div>

      <table className="w-full table-auto border border-collapse mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">Department Name</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((dept) => (
            <tr key={dept.dept_id}>
              <td className="border px-4 py-2">{dept.dept_id}</td>
              <td className="border px-4 py-2">{dept.dept_name}</td>
              <td className="border px-4 py-2">{dept.description}</td>
              <td className="border px-4 py-2">
                <DepartmentButtons id={dept.dept_name} onDelete={handleDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
