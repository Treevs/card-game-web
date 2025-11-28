"use client";

import React, { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { Enemy } from "./Enemy";
import { PlayerStats } from "./PlayerStats";
import { Hand } from "./Hand";
import { EndTurnButton } from "./EndTurnButton";
import { Creature } from "./Creature";
import { createEnemy } from "@/data/enemies";

export function GameBoard() {
    const { state, startCombat } = useGame();

    // Start combat when component mounts
    useEffect(() => {
        if (!state.enemy) {
            const cultist = createEnemy({
                id: "cultist",
                name: "Cultist",
                hp: 50,
                maxHp: 50,
                intent: {
                    type: "attack",
                    value: 6,
                    description: "Attacks for 6 damage",
                },
                damage: 6,
            });
            startCombat(cultist);
        }
    }, [state.enemy, startCombat]);

    if (!state.enemy) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Loading combat...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
            <div className="max-w-6xl mx-auto">
                {/* Combat Log */}
                <div className="mb-4 bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-white font-bold mb-2">Combat Log</h3>
                    <div className="max-h-32 overflow-y-auto">
                        {state.combatLog.map((message, index) => (
                            <div
                                key={index}
                                className="text-gray-300 text-sm mb-1"
                            >
                                {message}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enemy Area */}
                <div className="mb-8 flex justify-center">
                    <Enemy enemy={state.enemy} />
                </div>

                {/* Creatures Area */}
                {state.player.creatures && state.player.creatures.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-white font-bold mb-4 text-center">
                            Your Creatures ({state.player.creatures.length})
                        </h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {state.player.creatures.map((creature) => (
                                <Creature key={creature.id} creature={creature} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Turn Info */}
                <div className="text-center mb-6">
                    <div className="text-white text-xl font-bold">
                        Turn {state.turn} -{" "}
                        {state.phase === "PLAYER_TURN"
                            ? "Your Turn"
                            : "Enemy Turn"}
                    </div>
                </div>

                {/* Player Area */}
                <div className="flex gap-6 mb-6">
                    <div className="flex-1">
                        <PlayerStats player={state.player} />
                    </div>
                    <div className="flex-1">
                        <EndTurnButton />
                    </div>
                </div>

                {/* Hand */}
                <div className="mb-6">
                    <h3 className="text-white font-bold mb-4 text-center">
                        Your Hand
                    </h3>
                    <Hand cards={state.player.hand} />
                </div>

                {/* Game Over Check */}
                {state.player.hp <= 0 && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-red-900/90 border-2 border-red-500 rounded-lg p-8 text-center">
                            <h2 className="text-4xl font-bold text-red-400 mb-4">
                                Game Over
                            </h2>
                            <p className="text-white text-xl mb-6">
                                You have been defeated!
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {state.enemy.hp <= 0 && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-green-900/90 border-2 border-green-500 rounded-lg p-8 text-center">
                            <h2 className="text-4xl font-bold text-green-400 mb-4">
                                Victory!
                            </h2>
                            <p className="text-white text-xl mb-6">
                                You have defeated {state.enemy.name}!
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
