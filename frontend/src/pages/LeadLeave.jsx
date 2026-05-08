import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
export default function LeadLeave(){
    const[leaveCount,setleaveCount]=useState(null)
    const[formData,setFormData]=useState(
      {
        type:'',
        fromDate:'',
        toDate:'',
        totDays:0,
        reason:'',
      }
    )
    const[dateMessage,setDateMessage]=useState('')
    const[exceedCount,setExceedCount]=useState('')
    const [pastDate,setPastDate]=useState('')
    const[successMessage,setSucMessage]=useState('')
    const[status,setStatus]=useState('')
    const[history,setHistory]=useState([])
    const handleSubmit=async (e)=>{
      e.preventDefault()
      if (dateMessage || pastDate || exceedCount) {
    return;
  }
      try{
       await axios.post('http://localhost:5000/api/leaves/apply',formData,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
      )
      setSucMessage('Leave Applied Successfully')
      setStatus('Pending')
}
      catch(err){
        console.log(err)
        setSucMessage('')

      }
    }
    const handleCancel = async (id) => {
  try {
    await axios.delete(
      `http://localhost:5000/api/leaves/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    
    setStatus('');
    setSucMessage("Leave Cancelled");

    
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
};
    useEffect(() => {
    axios
      .get("http://localhost:5000/leaves/summary", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result)=>{
        setleaveCount(result.data)
      })
      .catch((err)=>{
        console.log(err.message.data)
      })
    },[])
    useEffect(()=>{
       if (!leaveCount) return;
      if(formData.type=='Sick Leave'){
        if(formData.totDays>leaveCount.sick.remaining)
          setExceedCount('No of Days exceed remaining leaves')
        else
          setExceedCount('')
          
      }
      if(formData.type=='Casual Leave'){
        if(formData.totDays>leaveCount.casual.remaining)
          setExceedCount('No of Days exceed remaining leaves')
        else
          setExceedCount('')
          
      }
      if(formData.type=='Earned Leave'){
        if(formData.totDays>leaveCount.earned.remaining)
          setExceedCount('No of Days exceed remaining leaves')
        else
          setExceedCount('')
          
      }

    },[formData.totDays,formData.type,leaveCount])
  useEffect(()=>{
    if(!formData.fromDate||!formData.toDate) return;
    const from=new Date(formData.fromDate)
    const to=new Date(formData.toDate)
    const today=new Date()
    today.setHours(0,0,0,0)
    if(today>from || today>to)
    {
       setPastDate('Invalid date as date is of past')
    }
    else{
      setPastDate('')
    }
    if(to>=from){
      const diffTime = to - from;
        const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;
      setFormData(prev=>({...prev,totDays:diffDays}))
      setDateMessage('')
    }
    else{
      setFormData(prev=>({...prev,totDays:0}))
      setDateMessage('Invalid Date entry try again')
    }

  },[formData.fromDate,formData.toDate])
  useEffect(()=>{
    axios.get('http://localhost:5000/api/leaves/history',{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result)=>{
        setHistory(result.data)
      })
      .catch((err)=>{
        console.log(err.message.data)
      })
  },[])
   if (!leaveCount) {
    return <div>Loading...</div>;
  }
    return (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-6">
      Manage My Leaves
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Sick Leave Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Sick Leave
        </h3>

        <div className="space-y-2">
          <p className="text-gray-600">
            Total: <span className="font-medium">{leaveCount.sick.total}</span>
          </p>
          <p className="text-gray-600">
            Used: <span className="font-medium text-red-500">{leaveCount.sick.used}</span>
          </p>
          <p className="text-gray-600">
            Remaining: <span className="font-semibold text-green-600">{leaveCount.sick.remaining}</span>
          </p>
        </div>
      </div>

      {/* Casual Leave Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Casual Leave
        </h3>

        <div className="space-y-2">
          <p className="text-gray-600">
            Total: <span className="font-medium">{leaveCount.casual.total}</span>
          </p>
          <p className="text-gray-600">
            Used: <span className="font-medium text-red-500">{leaveCount.casual.used}</span>
          </p>
          <p className="text-gray-600">
            Remaining: <span className="font-semibold text-green-600">{leaveCount.casual.remaining}</span>
          </p>
        </div>
      </div>

      {/* Earned Leave Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Earned Leave
        </h3>

        <div className="space-y-2">
          <p className="text-gray-600">
            Total: <span className="font-medium">{leaveCount.earned.total}</span>
          </p>
          <p className="text-gray-600">
            Used: <span className="font-medium text-red-500">{leaveCount.earned.used}</span>
          </p>
          <p className="text-gray-600">
            Remaining: <span className="font-semibold text-green-600">{leaveCount.earned.remaining}</span>
          </p>
        </div>
      </div>

    </div>

    {/* Placeholder For Leave Form Tomorrow */}
   <div className="mt-10 bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto border">
  <h3 className="text-xl font-semibold mb-6 text-gray-800">
    Apply For Leave
  </h3>

  <form onSubmit={handleSubmit} className="space-y-5">

    {/* Leave Type */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Leave Type
      </label>
      <select
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        value={formData.type}
        onChange={(e)=>setFormData({...formData,type:e.target.value})}
      >
        <option value="">---SELECT---</option>
        <option value="Sick Leave">Sick Leave</option>
        <option value="Casual Leave">Casual Leave</option>
        <option value="Earned Leave">Earned Leave</option>
      </select>
    </div>

    {/* Date Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          From Date
        </label>
        <input
          type="date"
          value={formData.fromDate}
          onChange={(e)=>setFormData({...formData,fromDate:e.target.value})}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          To Date
        </label>
        <input
          type="date"
          value={formData.toDate}
          onChange={(e)=>setFormData({...formData,toDate:e.target.value})}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
      </div>
    </div>

    {/* Total Days */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Total Days
      </label>
      <input
        type="number"
        value={formData.totDays}
        disabled
        className="w-full border rounded-lg px-3 py-2 bg-gray-100"
      />
    </div>

    {/* Reason */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Reason
      </label>
      <textarea
        rows="4"
        placeholder="Enter reason for leave"
        value={formData.reason}
        onChange={(e)=>setFormData({...formData,reason:e.target.value})}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
      />
    </div>

    {/* Error Messages */}
    <div className="space-y-1">
      {dateMessage && <p className="text-red-500 text-sm">{dateMessage}</p>}
      {exceedCount && <p className="text-red-500 text-sm">{exceedCount}</p>}
      {pastDate && <p className="text-red-500 text-sm">{pastDate}</p>}
      {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition duration-200"
    >
      Apply Leave
    </button>

  </form>
  {status && (
  <div className="mt-6 flex items-center gap-4">
    
    {/* Status Badge */}
    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
      Status: {status}
    </span>

    {/* Cancel Button (Only if Pending) */}
    {/* {status === "Pending" && (
      <button
        onClick={handleCancel(leaveCount.id)}
        className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
      >
        Cancel Application
      </button>
    )} */}

  </div>
)}


</div>
<div className="mt-12 max-w-5xl mx-auto">
  <h3 className="text-xl font-semibold mb-4 text-gray-800">
    Leave History
  </h3>

  <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border">
    <table className="min-w-full text-sm text-left text-gray-600">

      {/* Table Head */}
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
        <tr>
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">Type</th>
          <th className="px-6 py-3">Start Date</th>
          <th className="px-6 py-3">End Date</th>
          <th className="px-6 py-3 text-center">Days</th>
          <th className="px-6 py-3">Reason</th>
          <th className="px-6 py-3 text-center">Status</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody className="divide-y divide-gray-200">

        {history.map((leave) => (
          <tr key={leave.id} className="hover:bg-gray-50 transition">

            <td className="px-6 py-4 font-medium text-gray-800">
              {leave.id}
            </td>

            <td className="px-6 py-4">
              {leave.type}
            </td>

            <td className="px-6 py-4">
              {leave.startDate}
            </td>

            <td className="px-6 py-4">
              {leave.endDate}
            </td>

            <td className="px-6 py-4 text-center font-semibold">
              {leave.total}
            </td>

            <td className="px-6 py-4 max-w-xs truncate">
              {leave.reason}
            </td>

            <td className="px-6 py-4 text-center">
              {leave.status === "Pending" && (
                <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
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
              <button onClick={()=>handleCancel(leave.id)}
              className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition">Cancel</button>
              </td>
            )}

          </tr>
        ))}

      </tbody>
    </table>
  </div>
</div>
  </div>
);
}
