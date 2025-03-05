import api from "./api";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("guest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token || !refreshToken) {
        logout();
        return;
      }

      try {
        const response = await api.post("/common/auth/introspect", { token });

        if (!response.data.valid) {
          const refreshResponse = await api.post("/common/auth/refresh", { token: refreshToken });

          if (refreshResponse.status === 200) {
            localStorage.setItem("token", refreshResponse.data.access_token);
            localStorage.setItem("refresh_token", refreshResponse.data.refresh_token);
          } else {
            logout();
          }
        }

        setRole(localStorage.getItem("role") || "guest");
        setIsLoggedIn(true);
      } catch (error) {
        
        if (error.response && error.response.status === 503) {
          return;
        }

        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole("guest");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);