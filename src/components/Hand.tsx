"use client";

import React from "react";
import { Card as CardType } from "@/types";
import { Card } from "./Card";
import { useGame } from "@/contexts/GameContext";

interface HandProps {
    cards: CardType[];
}

export function Hand({ cards }: HandProps) {
    const { state } = useGame();
    const isPlayerTurn = state.phase === "PLAYER_TURN";

    if (cards.length === 0) {
        return (
            <div className="flex justify-center items-center h-32 text-gray-400">
                <p>No cards in hand</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-end gap-2 min-h-80">
            {cards.map((card, index) => {
                const isPlayable =
                    isPlayerTurn && state.player.energy >= card.cost;

                return (
                    <div
                        key={card.id}
                        className="transform transition-all duration-200 hover:translate-y-[-20px]"
                        style={{
                            transform: `rotate(${
                                (index - (cards.length - 1) / 2) * 5
                            }deg) translateY(${index * 2}px)`,
                        }}
                    >
                        <Card card={card} isPlayable={isPlayable} />
                    </div>
                );
            })}
        </div>
    );
}
