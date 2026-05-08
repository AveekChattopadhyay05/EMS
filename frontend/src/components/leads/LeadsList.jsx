import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LeadButtons from "../../utils/LeadsHelp";
import NodeTree from "../leads/NodeTree"


// Tree Node Model

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


//  Recursive Tree Node Component

const TreeNodeComponent = ({ node, level = 0, onNodeAction, onUpdate }) => {
  const handleToggle = () => {
    node.toggle();
    onUpdate();
  };

  const handleAction = (action, data) => {
    onNodeAction(action, data);
  };

  const renderNodeContent = () => {
    if (node.type === "lead") {
      return (
        <div className="bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-center p-4 cursor-pointer" onClick={handleToggle}>
            <div className="flex-1 grid grid-cols-6 gap-4 items-center">
              <div className="font-semibold text-blue-700 flex items-center col-span-2">
                <svg
                  className={`w-4 h-4 transition-transform mr-3 ${node.isExpanded ? "rotate-90" : ""}`}
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
              <div className="text-gray-600">{node.data.email}</div>
              <div className="font-medium text-purple-600">{node.data.role}</div>
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                  onClick={() => handleAction("resetPassword", node.data.email)}
                >
                  Reset Password
                </button>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <LeadButtons 
                  lead={node.data} 
                  onDelete={(email) => handleAction("delete", email)} 
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (node.type === "employee") {
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

    if (node.type === "lead") {
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
                  <NodeTree
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


//  Full Leads List Component (Tree Logic)
// ───────────────────────────────────────────────────────────────
export default function LeadsList() {
  const [treeNodes, setTreeNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/lead/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const leadsData = response.data;
      const builtTree = buildTree(leadsData);
      setTreeNodes(builtTree);
      setFilteredNodes(builtTree);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leads with employees:", err);
      setLoading(false);
    }
  };

  const buildTree = (leadsData) => {
  return leadsData.map(buildNode);
};

const buildNode = (item) => {
  const node = new TreeNode(
    item.id,
    item.name,
    item.role === "lead" ? "lead" : "employee",
    item
  );

  if (item.employees && Array.isArray(item.employees)) {
    item.employees.forEach((child) => {
      node.addChild(buildNode(child)); // 🔥 RECURSION
    });
  }

  return node;
};


  const handleNodeAction = (action, data) => {
    if (action === "delete") {
      console.log("Delete lead:", data);
    } else if (action === "resetPassword") {
      console.log("Reset password for:", data);
    }
  };

  const handleSearch = () => {
    let filtered = treeNodes.filter((node) => {
      const matchesName = node.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesDept =
        !searchDept || (node.data.Dept && node.data.Dept.toLowerCase().includes(searchDept.toLowerCase()));
      return matchesName && matchesDept;
    });
    setFilteredNodes(filtered);
  };

  const handleUpdate = () => {
    setUpdateTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="text-lg">Loading Leads Tree...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-center mb-6">Leads & Employees Tree</h3>

      <div className="flex justify-between mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name"
            className="border px-3 py-2 rounded-md"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by department"
            className="border px-3 py-2 rounded-md"
            value={searchDept}
            onChange={(e) => setSearchDept(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <Link
          to="/admin-dashboard/add-lead"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Add Lead
        </Link>
      </div>

      {filteredNodes.length === 0 ? (
        <div className="text-center text-gray-500">No leads found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {filteredNodes.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              onNodeAction={handleNodeAction}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
