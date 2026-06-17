import React, { createContext, useContext, useState, useEffect } from "react";
import { adminLogin, getProfile } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { setLoading(false); return; }
    getProfile()
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem("admin_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await adminLogin(email, password);
    if (res.user?.role !== "admin") {
      throw new Error("This account does not have admin access");
    }
    localStorage.setItem("admin_token", res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
