"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Navbar />
            {children}
        </AuthProvider>
    );
}
