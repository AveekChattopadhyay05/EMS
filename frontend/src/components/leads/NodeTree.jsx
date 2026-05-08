import React, { useState } from "react";
import LeadButtons from "../../utils/LeadsHelp";
import { useNavigate } from "react-router-dom";
export default function NodeTree({ node, level = 0, onNodeAction }) {
  const [open, setOpen] = useState(false);
  const navigate=useNavigate()
  const[newPassword,setNewPassword]=useState('')
  const hasChildren = node.employees?.length > 0;
  const isLead = node.role === "lead";
  const ResetPassword= async (e)=>{
    e.preventDefault()
    await axios.put(`http://localhost:5000/lead/resetpassword/${id}`,{},{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
      .then((result)=>{
        console.log(result)
      })
      .catch((err)=>{
        console.log(err.response?.data||err.message)
      })

    )
  }

  return (
    <div style={{ marginLeft: level * 20 }}>
      {/* HEADER ROW */}
      <div className="flex items-center">
        {/* TOGGLE — depends ONLY on children */}
        {hasChildren && (
          <span
            className="mr-3 cursor-pointer"
            onClick={() => setOpen(prev => !prev)}
          >
            {open ? "⬇" : "➡"}
          </span>
        )}

        <span className="font-semibold text-blue-700">
          {node.name}
        </span>

        {isLead && (
          <span className="ml-2 text-sm text-gray-500">
            ({node.employees.length} employees)
          </span>
        )}
      </div>

      {/* LEAD DISPLAY + BUTTONS */}
      {isLead && (
        <div className="grid grid-cols-6 gap-4 items-center ml-6">
          <div className="text-gray-600 col-span-2">{node.email}</div>

          <div className="font-medium text-purple-600">
            {node.role}
          </div>

          {/* RESET PASSWORD */}
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
              onClick={() =>
                navigate('/admin-dashboard/reset-password')
              }
            >
              Reset Password
            </button>
          </div>

          {/* EDIT / DELETE BUTTONS */}
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <LeadButtons
              lead={node}
              onDelete={(email) =>
                onNodeAction?.("delete", email)
              }
            />
          </div>
        </div>
      )}

      {/* EMPLOYEE DISPLAY */}
      {!isLead && (
        <div className="grid grid-cols-5 gap-4 text-sm ml-6">
          <div className="font-medium">{node.email}</div>
          <div>{node.DOB}</div>
          <div>{node.Dept}</div>

          {node.id && (
            <div className="text-xs text-gray-500">
              ID: {node.id}
            </div>
          )}
        </div>
      )}

      {/* 🔁 RECURSION — UNCHANGED */}
      {open &&
        node.employees?.map(child => (
          <NodeTree
            key={child.id ?? child.name}
            node={child}
            level={level + 1}
            onNodeAction={onNodeAction}
          />
        ))}
    </div>
  );
}
