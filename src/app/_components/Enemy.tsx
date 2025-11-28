"use client";

import React from "react";
import { Enemy } from "@/types";

interface EnemyProps {
    enemy: Enemy;
}

export function Enemy({ enemy }: EnemyProps) {
    const hpPercentage = (enemy.hp / enemy.maxHp) * 100;

    const getIntentColor = () => {
        switch (enemy.intent.type) {
            case "attack":
                return "bg-red-500/20 border-red-500 text-red-400";
            case "block":
                return "bg-blue-500/20 border-blue-500 text-blue-400";
            case "buff":
                return "bg-green-500/20 border-green-500 text-green-400";
            case "debuff":
                return "bg-purple-500/20 border-purple-500 text-purple-400";
            default:
                return "bg-gray-500/20 border-gray-500 text-gray-400";
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
                {enemy.name}
            </h2>

            {/* HP Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-lg text-gray-300 mb-2">
                    <span>HP</span>
                    <span>
                        {enemy.hp}/{enemy.maxHp}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 ease-out"
                        style={{ width: `${hpPercentage}%` }}
                    />
                </div>
            </div>

            {/* Intent */}
            <div className={`rounded-lg p-4 border-2 ${getIntentColor()}`}>
                <div className="text-center">
                    <div className="text-sm font-semibold mb-1">Intent</div>
                    <div className="text-lg font-bold">
                        {enemy.intent.value}
                    </div>
                    <div className="text-sm opacity-80">
                        {enemy.intent.description}
                    </div>
                </div>
            </div>

            {/* Block */}
            {enemy.block && enemy.block > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded border border-blue-400" />
                    <span className="text-blue-400 font-bold text-lg">
                        {enemy.block}
                    </span>
                    <span className="text-gray-300">Block</span>
                </div>
            )}
        </div>
    );
}
