"use client";

import React from "react";
import { Creature as CreatureType } from "@/types";

interface CreatureProps {
    creature: CreatureType;
}

export function Creature({ creature }: CreatureProps) {
    const hpPercentage = (creature.hp / creature.maxHp) * 100;

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 min-w-[200px]">
            <h3 className="text-lg font-bold text-white mb-3 text-center">
                {creature.name}
            </h3>

            {/* HP Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>HP</span>
                    <span>
                        {creature.hp}/{creature.maxHp}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out"
                        style={{ width: `${hpPercentage}%` }}
                    />
                </div>
            </div>

            {/* Attack */}
            <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded border border-red-400" />
                <span className="text-red-400 font-bold text-lg">
                    {creature.attack}
                </span>
                <span className="text-gray-300 text-sm">ATK</span>
            </div>
        </div>
    );
}


