import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function AddDepartment(){
    const[deptName,setDeptName]=useState('')
    const[description,setDescription]=useState('')
   
    const navigate=useNavigate()
    const handleSubmit=(e)=>{
        e.preventDefault()
        axios.post('http://localhost:5000/api/department/add',{deptName,description},{
            headers:{
                "Authorization":`Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(result=>{
            if(result.data.success){
                navigate('/admin-dashboard/departments')
                console.log("Department added successfully")
            }
        })
        .catch(error=>{
            if(error.response && error.response.data && error.response.data.success===false)
            {
                alert(error.response.data.error)
            }
            else{
                console.log("Unexpected error: ",error)
            }
        })
    }

    
   return(
    <>
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
  <h2 className="text-2xl font-bold mb-6">Add New Department</h2>
  <form onSubmit={handleSubmit}>
    <div>
      <label
        htmlFor="dep_name"
        className="text-sm font-medium text-gray-700"
      >
        Department Name
      </label>
      <input
        onChange={(e)=>setDeptName(e.target.value)}
        type="text"
        name="dep_name"
        placeholder="Department Name"
        className="mt-1 w-full p-2 border border-gray-300 rounded-md"

        required
      />
    </div>
   <div className="mt-3">
  <label
  
    htmlFor="description"
    className="block text-sm font-medium text-gray-700"
  >
    Description
  </label>
  <textarea
  onChange={(e)=>setDescription(e.target.value)}
    name="description"
    placeholder="Description"
    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
    rows="4"
  ></textarea>
</div>

<button
  type="submit"
  className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md"
>
  Add Department
</button>
</form>
</div>


    </>
   )
}