import React, { useEffect, useState } from "react";
import axios from "axios";
import NodeTree from "./NodeTree";

/* 
   ROOT SELECTION HELPERS
   */

const getRootNodes = (nodes) => {
  const childNames = new Set();

  const collectChildren = (node) => {
    node.employees?.forEach((child) => {
      childNames.add(child.name);
      collectChildren(child);
    });
  };

  nodes.forEach(collectChildren);

  return nodes.filter((node) => !childNames.has(node.name));
};

export default function LeadsTree({ onNodeAction }) {
  const [treeData, setTreeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [searchDept, setSearchDept] = useState("");

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lead/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      
      setTreeData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error("Failed to fetch tree", err);
    }
  };



  const handleSearch = () => {
    let filtered = [...treeData];

    if (searchName.trim()) {
      filtered = filtered.filter((node) =>
        node.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchDept.trim()) {
      filtered = filtered.filter(
        (node) =>
          node.Dept?.toLowerCase().includes(searchDept.toLowerCase()) ||
          node.employees?.some((emp) =>
            emp.Dept?.toLowerCase().includes(searchDept.toLowerCase())
          )
      );
    }

    setFilteredData(filtered);
  };

  /* 
     APPLY ROOT FILTER HERE
      */

  const rootNodes = getRootNodes(filteredData);

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-center mb-6">
        Leads & Employees Tree
      </h3>

      {/* SEARCH UI */}
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
      </div>

      {/* TREE RENDER */}
      {rootNodes.length === 0 ? (
        <div className="text-center text-gray-500">
          No results found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {rootNodes.map((root) => (
            <NodeTree
              key={root.id ?? root.name}
              node={root}
              onNodeAction={onNodeAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
