/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isAuthenticated = Boolean(token);
    const isAdmin = user?.role === "admin";

    // Keep localStorage in sync when login is called
    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Logout: Clear storage and reset state
    const logout = () => {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // Optionally fetch fresh profile if token exists on mount
    useEffect(() => {
        if (token) {
            api.get("/auth/me")
                .then((res) => {
                    if (res.data?.user) {
                        setUser(res.data.user);
                        localStorage.setItem("user", JSON.stringify(res.data.user));
                    }
                })
                .catch(() => {
                    // Token expired or invalid
                    logout();
                });
        }
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                isAdmin,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
