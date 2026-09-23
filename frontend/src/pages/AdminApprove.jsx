import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
export default function AdminApprove(){
 
    const [loading,setLoading]=useState(false)
    const [data,setData]=useState([])
    const[disperr,setDispErr]=useState('')
    const[apprej,setAppRej]=useState('')
    const[success,setSuccess]=useState(false)
    const[history,setHistory]=useState([])
    const[open,setOpen]=useState(false)
    const [view,setView]=useState(false)
    const [showReason, setShowReason] = useState(false)
const [selectedReason, setSelectedReason] = useState("")
const handleView = (reason) => {
  setSelectedReason(reason)
  setShowReason(true)
}
    const approveLeave = async (id) => {
  try {

    await axios.put(
      `http://localhost:5000/api/leaves/approve/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
    )

    setAppRej('Update Successful')
    setSuccess(true)
    setData(prev => prev.filter(leave => leave.id !== id))

  } catch (err) {
    console.log(err.response?.data || err.message)
  }
}
    const rejectLeave = async (id) => {
  try {

    await axios.put(
      `http://localhost:5000/api/leaves/reject/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
    )

    setAppRej('Update Successful')
    setSuccess(true)
    setData(prev => prev.filter(leave => leave.id !== id))

  } catch (err) {
    console.log(err.response?.data || err.message)
  }
}
    useEffect(()=>{
        setLoading(true)
         axios.get('http://localhost:5000/api/admin-leaves/approve',{
            
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      
        })
        .then((result)=>{
        setData(result.data)
        setLoading(false)})
        .then(
            console.log(localStorage.getItem("token"))
        )
        .catch((err)=>{
          setDispErr(err.response?.data?.error || err.message)
          console.log(err)
          setLoading(false)

        })


    },[])
    useEffect(()=>{
     
       axios.get('http://localhost:5000/api/admin-leaves/approve/history',{
            
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      
        })
        .then((result)=>{
          setHistory(result.data)
        })
        .catch((err)=>{
          setDispErr(err.response?.data?.error || err.message)
        })
    },[])
    
    return(
        <>
        <div>Here Applying Will Work</div>
        
  <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border">
    {data.length===0 ? (<p>No pending leaves to approve/reject</p>) : (<table className="min-w-full text-sm text-left text-gray-600">

      {/* Table Head */}
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
        <tr>
          <th className="px-4 py-3">ID</th>
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Type</th>
          <th className="px-4 py-3">Start Date</th>
          <th className="px-4 py-3">End Date</th>
          <th className="px-4 py-3 text-center">Days</th>
          <th className="px-4 py-3">Reason</th>
          <th className="px-4 py-3 text-center">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((leave)=>(
            <tr key={leave.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.id}
                </td>
               <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.name}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.type}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.from}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.to}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.total}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                  <button
                    className="text-blue-600 font-medium hover:underline"
                     onClick={() => handleView(leave.reason)}
                  >
                     View
                  </button>
                    {/* {leave.reason} */}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                   {leave.status === "Pending" && (
                <span className="px-4 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                  Pending
                </span>
              )}
              {leave.status === "Approved" && (
                <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                  Approved
                </span>
              )}
              {leave.status === "Rejected" && (
                <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                  Rejected
                </span>
              )}
              
                </td>
                {leave.status==='Pending' && (
                <td>
                <button className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition" onClick={()=>approveLeave(leave.id)}>Approve</button>
                <button className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition" onClick={()=>rejectLeave(leave.id)}>Reject</button>
                </td>
              )}
                

            </tr>
        ))}
      </tbody>
      </table>)}
      
    
     
      </div>
       <div>
        RECENT RECORDS
        <span
            className="mr-3 cursor-pointer"
            onClick={() => setOpen(prev => !prev)}
          >
            {open ?  "⬇" : "➡"}
          </span>
        {open && (<table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
        <tr>
          <th className="px-4 py-3">ID</th>
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Type</th>
          <th className="px-4 py-3">Start Date</th>
          <th className="px-4 py-3">End Date</th>
          <th className="px-4 py-3 text-center">Days</th>
          <th className="px-4 py-3">Reason</th>
          <th className="px-4 py-3 text-center">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {history.map((leave)=>(
            <tr key={leave.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.id}
                </td>
               <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.name}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.type}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.from}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.to}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                    {leave.total}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                  <button
                    className="text-blue-600 font-medium hover:underline"
                     onClick={() => handleView(leave.reason)}
                  >
                     View
                  </button>
                    {/* {leave.reason} */}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">
                   {leave.status === "Pending" && (
                <span className="px-4 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                  Pending
                </span>
              )}
              {leave.status === "Approved" && (
                <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                  Approved
                </span>
              )}
              {leave.status === "Rejected" && (
                <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                  Rejected
                </span>
              )}
              
                </td>
                
                

            </tr>
        ))}
      </tbody>
      
        </table>
        
      )}
        {showReason && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
    
    <div className="bg-white p-6 rounded-xl shadow-lg w-96">
      
      <h2 className="text-lg font-semibold mb-4">Leave Reason</h2>
      
      <p className="text-gray-600">{selectedReason}</p>

      <div className="mt-4 text-right">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={() => setShowReason(false)}
        >
          Close
        </button>
      </div>

    </div>

  </div>
)}
      </div>

        </>
    )
}