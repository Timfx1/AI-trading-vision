import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const BACKEND = "http://127.0.0.1:5000";

  // Load user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("auth_token");
    }
  }, []);

  // Login with Google
  const loginWithGoogle = async (credential) => {
    try {
      const res = await axios.post(`${BACKEND}/api/auth/google`, {
        credential,
      });

      const { token } = res.data;
      localStorage.setItem("auth_token", token);

      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
