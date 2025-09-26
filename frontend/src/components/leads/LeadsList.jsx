import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LeadButtons from "../../utils/LeadsHelp";

// Tree Node Data Models
class TreeNode {
  constructor(id, name, type, data = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.data = data;
    this.children = [];
    this.isExpanded = false;
  }

  addChild(child) {
    this.children.push(child);
    return this;
  }

  hasChildren() {
    return this.children.length > 0;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}

// Recursive Tree Node Component
const TreeNodeComponent = ({ node, level = 0, onNodeAction, onUpdate }) => {
  const handleToggle = () => {
    node.toggle();
    onUpdate();
  };

  const handleAction = (action, data) => {
    onNodeAction(action, data);
  };

  const renderNodeContent = () => {
    if (node.type === 'lead') {
      return (
        <div className="bg-gray-50 hover:bg-gray-100 transition-colors">
          {/* Make the entire div clickable to toggle expansion */}
          <div
            className="flex items-center p-4 cursor-pointer"
            onClick={handleToggle}
          >
            <div className="flex-1 grid grid-cols-6 gap-4 items-center">
              {/* Column 1: Name with expand/collapse icon */}
              <div className="font-semibold text-blue-700 flex items-center col-span-2">
                <svg
                  className={`w-4 h-4 transition-transform mr-3 ${
                    node.isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {node.name}
                <span className="ml-2 text-sm text-gray-500">
                  ({node.children.length} employees)
                </span>
              </div>
              
              {/* Column 2: Email */}
              <div className="text-gray-600">{node.data.email}</div>

              {/* Column 3: Role */}
              <div className="font-medium text-purple-600">{node.data.role}</div>

              {/* Column 4 & 5: Action Buttons (wrapped to stop click propagation) */}
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                  onClick={() => handleAction('resetPassword', node.data.email)}
                >
                  Reset Password
                </button>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <LeadButtons 
                  lead={node.data} 
                  onDelete={(email) => handleAction('delete', email)} 
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (node.type === 'employee') {
      return (
        <div className="flex items-center py-2 px-4 border-b border-gray-100 last:border-b-0 hover:bg-blue-50">
          <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="font-medium">{node.name}</span>
            </div>
            <div className="text-gray-600">{node.data.email}</div>
            <div className="text-gray-600">{node.data.DOB}</div>
            <div className="text-gray-600">{node.data.Dept}</div>
            <div className="text-xs text-gray-500">ID: {node.data.id}</div>
          </div>
        </div>
      );
    }
  };

  const renderChildren = () => {
    if (!node.isExpanded || !node.hasChildren()) return null;

    if (node.type === 'lead') {
      return (
        <div className="bg-white">
          {node.children.length === 0 ? (
            <div className="px-12 py-3 text-gray-500 text-sm italic">
              No employees under this lead
            </div>
          ) : (
            <div className="px-8">
              <div className="border-l-2 border-blue-200 ml-4">
                {node.children.map((child) => (
                  <TreeNodeComponent
                    key={child.id}
                    node={child}
                    level={level + 1}
                    onNodeAction={onNodeAction}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ marginLeft: `${(level + 1) * 20}px` }}>
        {node.children.map((child) => (
          <TreeNodeComponent
            key={child.id}
            node={child}
            level={level + 1}
            onNodeAction={onNodeAction}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {renderNodeContent()}
      {renderChildren()}
    </div>
  );
};


// Main Leads List Component
export default function LeadsList() {
  const [treeNodes, setTreeNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    fetchLeadsWithEmployees();
  }, []);

  const fetchLeadsWithEmployees = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/lead/list-with-employees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result) => {
        const nodes = buildTreeNodes(result.data);
        setTreeNodes(nodes);
        setFilteredNodes(nodes);

        const deptSet = [...new Set(result.data.map((lead) => lead.role))];
        setDepartments(deptSet);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching leads with employees: ", err);
        setLoading(false);
      });
  };

  const buildTreeNodes = (leadsData) => {
    return leadsData.map((lead) => {
      const leadNode = new TreeNode(
        `lead-${lead.email}`,
        lead.name,
        'lead',
        lead
      );

      // Add employee children
      lead.employees.forEach((employee) => {
        const employeeNode = new TreeNode(
          `employee-${employee.id}`,
          employee.name,
          'employee',
          employee
        );
        leadNode.addChild(employeeNode);
      });

      return leadNode;
    });
  };

  const handleNodeAction = (action, data) => {
    switch (action) {
      case 'delete':
        handleDelete(data);
        break;
      case 'resetPassword':
        handleResetPassword(data);
        break;
      default:
        break;
    }
  };

  const handleDelete = (email) => {
    axios
      .delete(`http://localhost:5000/api/lead/delete`, {
        data: { id: email }, // The backend expects the email in the 'id' field of the body
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        fetchLeadsWithEmployees(); // Refresh data
      })
      .catch((err) => {
        console.error("Error deleting lead:", err);
        alert("Failed to delete lead");
      });
  };

  const handleResetPassword = (email) => {
    const newPassword = prompt("Enter new password for this lead:");
    if (newPassword && newPassword.trim() !== "") {
      axios
        .put(
          `http://localhost:5000/api/lead/reset-password/${email}`,
          { newPassword },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          alert(res.data.success);
        })
        .catch((err) => {
          console.error("Error resetting password:", err);
          alert(err.response?.data?.error || "Failed to reset password");
        });
    }
  };

  const handleUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  const applyFilters = (nodes, nameFilter, deptFilter) => {
    return nodes.filter(node => {
      const matchesName = !nameFilter || 
        node.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesDept = !deptFilter || node.data.role === deptFilter;
      return matchesName && matchesDept;
    });
  };

  const handleNameFilter = (e) => {
    const value = e.target.value;
    setSearchName(value);
    const filtered = applyFilters(treeNodes, value, searchDept);
    setFilteredNodes(filtered);
  };

  const handleDeptFilter = (e) => {
    const value = e.target.value;
    setSearchDept(value);
    const filtered = applyFilters(treeNodes, searchName, value);
    setFilteredNodes(filtered);
  };

  const expandAll = () => {
    filteredNodes.forEach(node => {
      node.isExpanded = true;
    });
    handleUpdate();
  };

  const collapseAll = () => {
    filteredNodes.forEach(node => {
      node.isExpanded = false;
    });
    handleUpdate();
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="text-lg">Loading leads and employees...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Manage Leads - Tree Structure</h3>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 mb-4">
        <input
          onChange={handleNameFilter}
          type="text"
          placeholder="Search By Lead Name"
          className="px-4 py-0.5 border"
          value={searchName}
        />

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

        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
          >
            Collapse All
          </button>
        </div>

        <Link
          to="/admin-dashboard/add-lead"
          className="px-4 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded"
        >
          Add New Lead
        </Link>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {filteredNodes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No leads found matching your criteria
          </div>
        ) : (
          filteredNodes.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              level={0}
              onNodeAction={handleNodeAction}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Total Leads: {filteredNodes.length}</span>
          <span>
            Total Employees: {filteredNodes.reduce((sum, node) => sum + node.children.length, 0)}
          </span>
        </div>
      </div>
    </>
  );
}