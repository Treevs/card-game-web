"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useMyCollectionQuery } from "@/generated/generates";
import { Card } from "@/app/_components/Card";

export default function CollectionPage() {
    const { user, loading: authLoading } = useAuth();
    const { data, loading, error } = useMyCollectionQuery({
        skip: !user, // Skip query if user is not authenticated
    });

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Please log in to view your collection
                    </h2>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Show loading state while fetching collection
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-white text-xl">
                    Loading your collection...
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">
                        Error loading collection
                    </h2>
                    <p className="text-gray-400 mb-4">{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const cards = data?.me?.collection?.cards;

    // Show empty state
    if (!cards || cards.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Your collection is empty
                    </h2>
                    <p className="text-gray-400">
                        Start playing to collect cards!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        My Collection
                    </h1>
                    <p className="text-gray-400">
                        {cards.length} unique card
                        {cards.length !== 1 ? "s" : ""} in your collection
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {cards.map(({ card, quantity }) => (
                        <div key={card.id} className="relative">
                            <Card card={card} isPlayable={false} />
                            {/* Quantity Badge */}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-900">
                                {quantity}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
