'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { currentUser as defaultUser, UserProfile } from '@/data/mockData';

export interface UserData {
    name: string;
    regNo: string;
    email: string;
    avatar: string;
    major: string;
    year: string;
    gpa: number;
    ruviScore: number;
    totalPoints: number;
    streak: number;
    rank: number;
}

interface UserContextType {
    user: UserData;
    updateUser: (data: Partial<UserData>) => void;
    logout: () => void;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'vit-meridian_user_profile';

function getInitials(name: string): string {
    if (!name || !name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const initialDefaultUser: UserData = {
    name: '',
    regNo: '',
    email: '',
    avatar: 'ST',
    major: '',
    year: '',
    gpa: 0,
    ruviScore: 0,
    totalPoints: 0,
    streak: 0,
    rank: 0,
};

const UserContext = createContext<UserContextType>({
    user: initialDefaultUser,
    updateUser: () => { },
    logout: () => { },
    isEditModalOpen: false,
    setIsEditModalOpen: () => { },
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData>(initialDefaultUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setUser((prev) => ({
                    ...prev,
                    ...parsed,
                    avatar: getInitials(parsed.name || prev.name),
                }));
            } else {
                // Check if user has prompt on first visit
                setIsEditModalOpen(true);
            }
        } catch (e) {
            console.error('Failed to load user profile from storage', e);
        }
        setIsLoaded(true);
    }, []);

    const updateUser = (data: Partial<UserData>) => {
        setUser((prev) => {
            const updated = {
                ...prev,
                ...data,
                avatar: data.name ? getInitials(data.name) : prev.avatar,
            };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to save user profile to storage', e);
            }
            return updated;
        });
    };

    const logout = () => {
        setUser(initialDefaultUser);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear user profile from storage', e);
        }
    };

    return (
        <UserContext.Provider value={{ user, updateUser, logout, isEditModalOpen, setIsEditModalOpen }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
