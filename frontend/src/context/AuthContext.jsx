import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, logout as logoutApi, getProfile } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    await loginApi(username, password);
    const profile = await getProfile();
    setUser(profile);
  };
  
  const logout = () => {
    logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}