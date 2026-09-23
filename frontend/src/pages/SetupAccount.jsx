import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SetupAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repass, setRep] = useState("");
  const [err, setErr] = useState("");
  const [suc, setSuc] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuc("");

    // 1️⃣ Basic validation
    if (!email || !password || !repass) {
      return setErr("All fields are required");
    }

    if (password !== repass) {
      return setErr("Passwords do not match");
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/setup-account",
        { email, password }
      );

      setSuc(response.data.message);

      // Optional: redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      if (error.response && error.response.data.error) {
        setErr(error.response.data.error);
      } else {
        setErr("Something went wrong");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-xl font-semibold mb-6 text-center">
          Set Up Account
        </h2>

        {err && (
          <div className="mb-4 text-red-600 text-sm">{err}</div>
        )}

        {suc && (
          <div className="mb-4 text-green-600 text-sm">{suc}</div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="*****"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="*****"
            onChange={(e) => setRep(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded transition duration-200"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}