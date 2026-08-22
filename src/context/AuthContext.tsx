'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'employee' | null;

export interface AuthUser {
    name: string;
    id: string;      // regNo for student, employeeId for employee
    email: string;
    role: UserRole;
    department?: string;
}

interface AuthContextType {
    authUser: AuthUser | null;
    role: UserRole;
    login: (user: AuthUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    authUser: null,
    role: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
});

const AUTH_STORAGE_KEY = 'vit-meridian_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(AUTH_STORAGE_KEY);
            if (saved) {
                setAuthUser(JSON.parse(saved));
            }
        } catch {
            // ignore
        }
    }, []);

    const login = (user: AuthUser) => {
        setAuthUser(user);
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } catch {}
    };

    const logout = () => {
        setAuthUser(null);
        try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {}
    };

    return (
        <AuthContext.Provider
            value={{
                authUser,
                role: authUser?.role ?? null,
                login,
                logout,
                isAuthenticated: !!authUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
