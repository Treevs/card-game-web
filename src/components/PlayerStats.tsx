"use client";

import React from "react";
import { Player } from "@/types";

interface PlayerStatsProps {
    player: Player;
}

export function PlayerStats({ player }: PlayerStatsProps) {
    const hpPercentage = (player.hp / player.maxHp) * 100;

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <h2 className="text-xl font-bold text-white mb-4">Player</h2>

            {/* HP Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>HP</span>
                    <span>
                        {player.hp}/{player.maxHp}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 ease-out"
                        style={{ width: `${hpPercentage}%` }}
                    />
                </div>
            </div>

            {/* Energy */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Energy</span>
                    <span>
                        {player.energy}/{player.maxEnergy}
                    </span>
                </div>
                <div className="flex gap-2">
                    {Array.from({ length: player.maxEnergy }, (_, i) => (
                        <div
                            key={i}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                i < player.energy
                                    ? "bg-yellow-400 border-yellow-400 shadow-lg shadow-yellow-400/50"
                                    : "bg-gray-600 border-gray-500"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Block */}
            {player.block > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded border border-blue-400" />
                        <span className="text-blue-400 font-bold">
                            {player.block}
                        </span>
                        <span className="text-gray-300 text-sm">Block</span>
                    </div>
                </div>
            )}

            {/* Deck Info */}
            <div className="text-sm text-gray-400">
                <div>Hand: {player.hand.length}</div>
                <div>Draw Pile: {player.drawPile.length}</div>
                <div>Discard: {player.discardPile.length}</div>
            </div>
        </div>
    );
}
