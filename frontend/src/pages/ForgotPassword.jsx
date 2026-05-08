import React from "react";
import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword(){
    const navigate=useNavigate()
  const [email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const handleSubmit=async (e)=>{
    e.preventDefault()
    await axios.put(`http://localhost:5000/api/lead/reset-password/${email}`,{
      newPassword:password},{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result)=>{
        console.log(result)
      })
      .catch((err)=>{
        console.log(err.response?.data||err.message)
      })
      navigate('/login')
  }

    return(
        <>
        <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "60vh"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          width: "250px",
          textAlign: "center"
        }}
      >
        <h3>Enter Email</h3>
         <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            margin: "10px 0"
          }}
        />

        <h3>Change Password</h3>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            margin: "10px 0"
          }}
        />

        <button 
          type="submit"
          style={{
            width: "100%",
            padding: "8px",
            cursor: "pointer"
          }}
        >
          Update
        </button>
      </form>
      </div>
        </>

   
    )
}