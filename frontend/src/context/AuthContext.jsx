import { Result } from "postcss";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Create the context
const UserContext = createContext();

// 2. Create a provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. Custom hook to use the context
export const useAuth = () => useContext(UserContext);