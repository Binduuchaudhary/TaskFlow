import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ttm_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("ttm_token")));

  useEffect(() => {
    const token = localStorage.getItem("ttm_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("ttm_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("ttm_token");
        localStorage.removeItem("ttm_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const data = await api.login(payload);
    localStorage.setItem("ttm_token", data.token);
    localStorage.setItem("ttm_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await api.signup(payload);
    localStorage.setItem("ttm_token", data.token);
    localStorage.setItem("ttm_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("ttm_token");
    localStorage.removeItem("ttm_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      login,
      signup,
      logout
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
