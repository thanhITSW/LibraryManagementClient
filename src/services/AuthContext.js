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
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.post("/common/auth/introspect", { token }, { requiresAuth: true });
                if (response.data.valid) {
                    setRole(localStorage.getItem("role") || "guest");
                    setIsLoggedIn(true);
                }
            } catch (error) {
                if (error.response && error.response.status === 503) {
                    return;
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkToken();
    }, []);

    const logout = () => {
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, role, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);