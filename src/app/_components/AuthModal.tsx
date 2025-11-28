"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "login" | "register";
}

export function AuthModal({
    isOpen,
    onClose,
    initialTab = "login",
}: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">(
        initialTab
    );
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
            onClose();
            setUsername("");
            setPassword("");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(username, email, password);
            onClose();
            setUsername("");
            setEmail("");
            setPassword("");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: "login" | "register") => {
        setActiveTab(tab);
        setError("");
        setUsername("");
        setEmail("");
        setPassword("");
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                            activeTab === "login"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-gray-300"
                        }`}
                        onClick={() => handleTabChange("login")}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                            activeTab === "register"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-gray-300"
                        }`}
                        onClick={() => handleTabChange("register")}
                    >
                        Register
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                {activeTab === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label
                                htmlFor="login-username"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Username
                            </label>
                            <input
                                id="login-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="login-password"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                                placeholder="Enter your password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                )}

                {/* Register Form */}
                {activeTab === "register" && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label
                                htmlFor="register-username"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Username
                            </label>
                            <input
                                id="register-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                                placeholder="Choose a username"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="register-email"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="register-password"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                                placeholder="Choose a password (min 6 characters)"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
