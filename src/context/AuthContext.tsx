import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, clearAuthToken } from "@/lib/api";

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ✔ Carrega o token quando a aplicação inicia
    useEffect(() => {
        const token = getAuthToken();
        setIsAuthenticated(!!token);
    }, []);

    // ✔ Se o token mudar no localStorage, o estado atualiza sozinho
    useEffect(() => {
        const interval = setInterval(() => {
            const token = getAuthToken();
            setIsAuthenticated(!!token);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const login = () => {
        const token = getAuthToken();
        if (token) {
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        clearAuthToken();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    }
    return ctx;
};
