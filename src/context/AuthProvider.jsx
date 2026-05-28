import { useEffect, useState } from "react";
import api from "../lib/axios";
import AuthContext from "./auth.context";
import Swal from "sweetalert2";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await api.get("/api/auth/me");

            const userData = res.data.user ?? res.data;

            setUser(userData);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('role', userData.role);
        } catch {
            setUser(null);

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/api/logout");
        } finally {
            setUser(null);
            setLoading(false);

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, fetchUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
