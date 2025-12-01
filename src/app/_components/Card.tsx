"use client";

import React from "react";
import { useGame } from "@/contexts/GameContext";
import { type CollectionCardFragment } from "@/generated/generates";

interface CardProps {
    card: CollectionCardFragment;
    isPlayable?: boolean;
    onClick?: () => void;
}

export function Card({ card, isPlayable = true, onClick }: CardProps) {
    const { playCard } = useGame();

    const handleClick = () => {
        if (isPlayable && onClick) {
            onClick();
        } else if (isPlayable) {
            playCard(card.id);
        }
    };

    const getCardColor = () => {
        switch (card.type) {
            case "monster":
                return "bg-red-500/20 border-red-500/50";
            case "skill":
                return "bg-blue-500/20 border-blue-500/50";
            case "power":
                return "bg-purple-500/20 border-purple-500/50";
            default:
                return "bg-gray-500/20 border-gray-500/50";
        }
    };

    const getRarityColor = () => {
        switch (card.rarity) {
            case "common":
                return "text-gray-300";
            case "uncommon":
                return "text-green-400";
            case "rare":
                return "text-yellow-400";
            default:
                return "text-gray-300";
        }
    };

    return (
        <div
            className={`
        relative w-48 h-72 rounded-lg border-2 p-4 cursor-pointer
        transition-all duration-200 hover:scale-105 hover:shadow-lg
        ${getCardColor()}
        ${
            isPlayable
                ? "hover:shadow-xl hover:shadow-blue-500/25"
                : "opacity-50 cursor-not-allowed"
        }
        group
      `}
            onClick={handleClick}
        >
            {/* Energy Cost */}
            <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                {card.cost}
            </div>

            {/* Card Name */}
            <div className="mt-8 mb-2">
                <h3 className={`text-lg font-bold ${getRarityColor()}`}>
                    {card.name}
                </h3>
                {card.health && card.strength && (
                    <div className="text-xs text-green-400 mt-1">Summon</div>
                )}
            </div>

            {/* Card Art Placeholder */}
            <div className="w-full h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Card Art</span>
            </div>

            {/* Card Description */}
            <div className="text-sm text-gray-200 mb-3">{card.description}</div>

            {/* Card Stats */}
            <div className="absolute bottom-2 right-2 flex gap-2">
                {card.health && card.strength ? (
                    <>
                        <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                            {card.health} HP
                        </div>
                        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                            {card.strength} ATK
                        </div>
                    </>
                ) : (
                    <>
                        {card.strength && (
                            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                {card.strength}
                            </div>
                        )}
                        {card.health && (
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                                {card.health}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
    );
}
