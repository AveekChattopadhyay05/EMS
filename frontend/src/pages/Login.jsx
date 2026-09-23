import React, { useState } from "react";
import axios from 'axios';
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", { email, password });

    axios.post('http://localhost:5000/api/login', { email, password })
      .then(result => {
        console.log("Success:", result);
        localStorage.setItem("token", result.data.token);
        login(result.data.user);
        if (result.data.user.role === "admin") {
          navigate('/admin-dashboard');
        } 
        if(result.data.user.role==="employee") {
          navigate('/employee-dashboard');
        }
        if(result.data.user.role==='lead'){
          navigate('/lead-dashboard')
        }
      })
      .catch(err => {
        if (err.response) {
          console.error("Server error:", err.response.data);
          setError(err.response.data.error);
        } else if (err.request) {
          console.error("No response from server:", err.request);
          setError("No response from server. Please try again.");
        } else {
          console.error("Error in setting up request:", err.message);
          setError("Error in setting up request");
        }
      });
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6">
  <h2 className="font-sevillana text-4xl text-white drop-shadow-lg">
    Employee Management System
  </h2>

  <div className="relative border bg-white w-80 p-6 rounded-lg shadow-xl ring-1 ring-gray-300 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
    {error && <p className="text-red-500 mb-2">{error}</p>}
    <h2 className="text-2xl font-bold mb-4 text-center text-teal-700">Login</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          className="w-full px-3 py-2 border border-gray-300 rounded shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700">Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="*****"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <label className="inline-flex items-center">
          <input type="checkbox" className="form-checkbox" />
          <span className="ml-2 text-gray-700">Remember me</span>
        </label>
        <a href="/forgot-password"  className="text-teal-600 hover:underline text-sm">Forgot password?</a>
      </div>
      <div className="mb-2">
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded shadow-md transition duration-200 transform hover:scale-[1.02]"
          
        >
          Login
        </button>
        <p className="text-sm mt-3 text-gray-600">
           Don’t have a password?{" "}
           <Link
           to="/setup-account"
         className="text-blue-600 hover:underline"
       >
    Set up account
  </Link>
</p>
      </div>
    </form>
  </div>
</div>

  );
}
