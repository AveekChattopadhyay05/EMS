import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function AddLead(){
    const[error,setError]=useState('')
    const[name,setName]=useState('')
   
   const[email,setEmail]=useState('')
    const[password,setPassword]=useState('')
    const[role,setRole]=useState('')
   
    
    const navigate=useNavigate()
    const handleSubmit=(e)=>{
        e.preventDefault()
        axios.post('http://localhost:5000/api/lead/add',{name,email,password,role},{
            headers:{
                "Authorization":`Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(result=>{
            if(result.data.success){
                navigate('/admin-dashboard/leads')
                console.log("Employee added successfully")
            }
        })
        .catch(error => {
  if (error.response && error.response.data && error.response.data.error) {
    setError(error.response.data.error);   
  } else {
    setError("Unexpected error occurred");
  }
});

    }


    return(
        <>
        <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
        {error && <p className="text-red-500 mb-2">{error}</p>}
      <h2 className="text-2xl font-bold mb-6">Add New Lead</h2>
      <form onSubmit={handleSubmit} >
    <div>
      <label
        htmlFor="emp_name"
        className="text-sm font-medium text-gray-700"
      >
        Lead Name
      </label>
      <input
        onChange={(e)=>setName(e.target.value)}
        type="text"
        name="emp_name"
        placeholder="Department Name"
        className="mt-1 w-full p-2 border border-gray-300 rounded-md"

        required
      />
    </div>
    <div>
      <label
        htmlFor="emp_name"
        className="text-sm font-medium text-gray-700"
      >
        Email
      </label>
      <input
        onChange={(e)=>setEmail(e.target.value)}
        type="text"
        name="emp_name"
        placeholder="Department Name"
        className="mt-1 w-full p-2 border border-gray-300 rounded-md"

        required
      />
    </div>
    <div>
      <label
        htmlFor="emp_name"
        className="text-sm font-medium text-gray-700"
      >
        Password
      </label>
      <input
        onChange={(e)=>setPassword(e.target.value)}
        type="text"
        name="emp_name"
        placeholder="Department Name"
        className="mt-1 w-full p-2 border border-gray-300 rounded-md"

        required
      />
    </div>
   {/* <div className="mt-3">
  <label
  
    htmlFor="description"
    className="block text-sm font-medium text-gray-700"
  >
    DOB
  </label>
  <input
       onChange={(e)=>setDob(e.target.value)}
        type="text"
        name="dep_name"
        placeholder="Department Name"
        className="mt-1 w-full p-2 border border-gray-300 rounded-md"

        required
      />
</div> */}
<div>
      <label
        htmlFor="dep_name"
        className="text-sm font-medium text-gray-700"
      >
        Role
      </label>
      <input
        onChange={(e)=>setRole(e.target.value)}
        type="text"
        name="dep_name"
        placeholder="Department Name"
        className="mt-1 w-full p-2 border border-gray-300 rounded-md"

        required
      />
    </div>

<button
  type="submit"
  className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md"
>
  Add Lead
</button>
</form>
</div>
</>
 )
}