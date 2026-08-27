import React, { useEffect } from "react";
import SummaryCard from "./SummaryCard";
import { FaBuilding, FaUsers,FaMoneyBillWave,FaFileAlt,FaCheckCircle,FaHourglassHalf,FaTimesCircle } from "react-icons/fa";
import { useState } from "react";

import axios from "axios";

export default function AdminSummary(){
  const [data,setData]=useState('')
    useEffect(()=>{
        axios.get('http://localhost:5000/api/admin-leaves/summary',{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      .then((result)=>{
        setData(result.data)
      })
      .catch((err)=>{
        console.log(err.response?.data || err.message)
      })

    },[])
    return(
        <>
        <div className="p-6">
            <h3 className="text-2x1 font-bold">Dashboard Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <SummaryCard icon={<FaUsers/>} text={"Total Employees"} number={data.employees} color="bg-teal-600"/>
                 <SummaryCard icon={<FaBuilding/>} text={"Total Departments"} number={data.department} color="bg-yellow-600"/>
                 <SummaryCard icon={<FaMoneyBillWave />} text={"Monthly Salary"} number={"$654"} color="bg-red-600" />
                 </div>
                 <div className="mt-12">
                    <h4 className="text-center text-2x1 font-bold">Leave Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <SummaryCard icon={<FaFileAlt />} text="Leave Applied" number={data.total} color="bg-teal-600" />
                <SummaryCard icon={<FaCheckCircle />} text="Leave Approved" number={data.approved} color="bg-green-600" />
                <SummaryCard icon={<FaHourglassHalf />} text="Leave Pending" number={data.pending} color="bg-yellow-600" />
                <SummaryCard icon={<FaTimesCircle />} text="Leave Rejected" number={data.rejected} color="bg-red-600" />
            
                </div>
            </div>
        </div>
        </>
    )
}