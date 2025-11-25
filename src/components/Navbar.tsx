"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";

export function Navbar() {
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState<"login" | "register">("login");

    const handleLoginClick = () => {
        setModalTab("login");
        setIsModalOpen(true);
    };

    const handleRegisterClick = () => {
        setModalTab("register");
        setIsModalOpen(true);
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            <nav className="w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Brand */}
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold text-white">
                                Card Game
                            </h1>
                        </div>

                        {/* Right side - Auth buttons */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm font-medium"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleLoginClick}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={handleRegisterClick}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm font-medium"
                                    >
                                        Register
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialTab={modalTab}
            />
        </>
    );
}
