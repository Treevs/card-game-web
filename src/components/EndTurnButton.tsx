"use client";

import React from "react";
import { useGame } from "@/contexts/GameContext";

export function EndTurnButton() {
    const { state, endTurn } = useGame();
    const isPlayerTurn = state.phase === "PLAYER_TURN";

    return (
        <button
            onClick={endTurn}
            disabled={!isPlayerTurn}
            className={`
        px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200
        ${
            isPlayerTurn
                ? "bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg hover:shadow-xl"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }
      `}
        >
            {isPlayerTurn ? "End Turn" : "Enemy Turn..."}
        </button>
    );
}
