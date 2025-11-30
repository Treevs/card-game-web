"use client";

import {
    MeQuery,
    useCreateAccountMutation,
    useLoginMutation,
    useLogoutMutation,
    useMeQuery,
} from "@/generated/generates";
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

interface AuthContextType {
    user: MeQuery["me"] | null;
    loading: boolean;
    login: (username: string, password: string) => void;
    register: (username: string, email: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [loginMutation] = useLoginMutation();
    const [createAccountMutation] = useCreateAccountMutation();
    const [logoutMutation] = useLogoutMutation();
    const { data, loading } = useMeQuery();

    const login = (username: string, password: string) => {
        loginMutation({
            variables: {
                email: username,
                password: password,
            },
            refetchQueries: ["Me"],
        });
    };

    const register = (username: string, email: string, password: string) => {
        createAccountMutation({
            variables: {
                username: username,
                email: email,
                password: password,
            },
            refetchQueries: ["Me"],
        });
    };

    const logout = () => {
        logoutMutation({
            refetchQueries: ["Me"],
        });
    };

    const user = data?.me;
    console.log(user);

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
