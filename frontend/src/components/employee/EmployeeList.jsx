import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EmployeeButtons from "../../utils/EmployeeHelp";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [searchLead, setSearchLead] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/employee/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result) => {
        setEmployees(result.data);
        setFilteredEmployees(result.data);

        // collect unique departments
        const deptSet = [...new Set(result.data.map((emp) => emp.Dept))];
        setDepartments(deptSet);

        // collect unique leads
        const leadSet = [...new Set(result.data.map((emp) => emp.Dept_Lead))];
        setLeads(leadSet);

        console.log("Fetched employees:", result.data);
      })
      .catch((err) => {
        console.log("Error fetching employees: ", err);
      });
  }, []);

  const handleDelete = (id) => {
    const updated = employees.filter((emp) => emp.id !== id);
    setEmployees(updated);
    applyFilters(updated, searchName, searchDept, searchLead);
  };

  const applyFilters = (list, nameFilter, deptFilter, leadFilter) => {
    let filtered = list;

    if (nameFilter) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (deptFilter) {
      filtered = filtered.filter((emp) => emp.Dept === deptFilter);
    }

    if (leadFilter) {
      filtered = filtered.filter((emp) => emp.Dept_Lead === leadFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleNameFilter = (e) => {
    const value = e.target.value;
    setSearchName(value);
    applyFilters(employees, value, searchDept, searchLead);
  };

  const handleDeptFilter = (e) => {
    const value = e.target.value;
    setSearchDept(value);
    applyFilters(employees, searchName, value, searchLead);
  };

  const handleLeadFilter = (e) => {
    const value = e.target.value;
    setSearchLead(value);
    applyFilters(employees, searchName, searchDept, value);
  };

  return (
    <>
      <div className="p-5">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Manage Employees</h3>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        {/* Search by name */}
        <input
          onChange={handleNameFilter}
          type="text"
          placeholder="Search By Employee Name"
          className="px-4 py-0.5 border"
        />

        {/* Dropdown for departments */}
        <select
          onChange={handleDeptFilter}
          className="px-4 py-0.5 border"
          value={searchDept}
        >
          <option value="">All Departments</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Dropdown for leads */}
        <select
          onChange={handleLeadFilter}
          className="px-4 py-0.5 border"
          value={searchLead}
        >
          <option value="">All Leads</option>
          {leads.map((lead, idx) => (
            <option key={idx} value={lead}>
              {lead}
            </option>
          ))}
        </select>

        <Link
          to="/admin-dashboard/add-employee"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add New Employee
        </Link>
      </div>

      <table className="w-full table-auto border border-collapse mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">DOB</th>
            <th className="border px-4 py-2">Department</th>
            <th className="border px-4 py-2">Lead</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp, index) => (
            <tr key={emp.id}>
              <td className="border px-4 py-2">{emp.id}</td>
              <td className="border px-4 py-2">{emp.name}</td>
              <td className="border px-4 py-2">{emp.email}</td>
              <td className="border px-4 py-2">{emp.DOB}</td>
              <td className="border px-4 py-2">{emp.Dept}</td>
              <td className="border px-4 py-2">{emp.Dept_Lead}</td>
              <td className="border px-4 py-2">
                <EmployeeButtons
                  id={emp.id}
                  name={emp.name}
                  onDelete={handleDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
