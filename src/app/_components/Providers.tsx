"use client";

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo-client";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={apolloClient}>
            <AuthProvider>
                <Navbar />
                {children}
            </AuthProvider>
        </ApolloProvider>
    );
}
