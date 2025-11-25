"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { GameState, GameAction, Player, Enemy } from "@/types";
import {
    createStarterDeck,
    drawCards,
    playCard as playCardLogic,
    dealDamage,
    creatureAttack,
    dealDamageToCreatures,
} from "@/utils/gameLogic";
import { createEnemy } from "@/data/enemies";

const initialState: GameState = {
    player: {
        hp: 80,
        maxHp: 80,
        energy: 3,
        maxEnergy: 3,
        block: 0,
        deck: createStarterDeck(),
        hand: [],
        drawPile: createStarterDeck(),
        discardPile: [],
        effects: [],
        creatures: [],
    },
    enemy: null,
    turn: 1,
    phase: "PLAYER_TURN",
    combatLog: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case "START_COMBAT": {
            const enemy = createEnemy(action.enemy);
            const { player, drawnCards } = drawCards(state.player, 5);

            return {
                ...state,
                player,
                enemy,
                phase: "PLAYER_TURN",
                turn: 1,
                combatLog: [`Combat started against ${enemy.name}!`],
            };
        }

        case "PLAY_CARD": {
            if (state.phase !== "PLAYER_TURN" || !state.enemy) return state;

            const card = state.player.hand.find((c) => c.id === action.cardId);
            if (!card) return state;

            try {
                const result = playCardLogic(card, state.player, state.enemy);

                const logMessages = [];
                if (result.creatureSummoned) {
                    logMessages.push(
                        `Summoned ${result.creatureSummoned.name} (${result.creatureSummoned.hp} HP, ${result.creatureSummoned.attack} ATK)`
                    );
                }
                if (result.damageDealt) {
                    logMessages.push(
                        `Dealt ${result.damageDealt} damage to ${state.enemy.name}`
                    );
                }
                if (result.blockGained) {
                    logMessages.push(`Gained ${result.blockGained} block`);
                }

                return {
                    ...state,
                    player: result.player,
                    enemy: result.target,
                    combatLog: [...state.combatLog, ...logMessages],
                };
            } catch (error) {
                return {
                    ...state,
                    combatLog: [...state.combatLog, "Not enough energy!"],
                };
            }
        }

        case "END_TURN": {
            if (state.phase !== "PLAYER_TURN" || !state.enemy) return state;

            const logMessages: string[] = [];
            let newEnemy = state.enemy;
            let newPlayer = state.player;

            // First: All creatures attack the enemy
            if (newPlayer.creatures && newPlayer.creatures.length > 0) {
                const attackResult = creatureAttack(newPlayer.creatures, newEnemy);
                newEnemy = attackResult.enemy;
                if (attackResult.totalDamage > 0) {
                    logMessages.push(
                        `Your creatures dealt ${attackResult.totalDamage} damage to ${newEnemy.name}!`
                    );
                }
            }

            // Then: Enemy attacks (damage goes to creatures first, then player)
            const enemyDamage = newEnemy.intent.value;
            if (enemyDamage > 0) {
                const damageResult = dealDamageToCreatures(newPlayer, enemyDamage);
                newPlayer = damageResult.player;

                if (damageResult.creaturesKilled > 0) {
                    logMessages.push(
                        `${damageResult.creaturesKilled} creature(s) died!`
                    );
                }

                if (damageResult.remainingDamage > 0) {
                    logMessages.push(
                        `${newEnemy.name} attacks for ${enemyDamage} damage! ${damageResult.remainingDamage} damage dealt to you.`
                    );
                } else if (damageResult.creaturesKilled === 0) {
                    logMessages.push(
                        `${newEnemy.name} attacks for ${enemyDamage} damage! All damage absorbed by creatures.`
                    );
                } else {
                    logMessages.push(
                        `${newEnemy.name} attacks for ${enemyDamage} damage!`
                    );
                }
            }

            return {
                ...state,
                player: newPlayer,
                enemy: newEnemy,
                phase: "ENEMY_TURN",
                combatLog: [...state.combatLog, ...logMessages],
            };
        }

        case "DRAW_CARDS": {
            const { player } = drawCards(state.player, action.amount);
            return {
                ...state,
                player,
            };
        }

        case "ENEMY_ATTACK": {
            if (state.phase !== "ENEMY_TURN" || !state.enemy) return state;

            // Start next turn
            const { player, drawnCards } = drawCards(state.player, 5);
            const newPlayer = {
                ...player,
                energy: 3,
                block: 0,
            };

            return {
                ...state,
                player: newPlayer,
                phase: "PLAYER_TURN",
                turn: state.turn + 1,
                combatLog: [
                    ...state.combatLog,
                    `Turn ${state.turn + 1} begins. Drew ${
                        drawnCards.length
                    } cards.`,
                ],
            };
        }

        case "ADD_LOG": {
            return {
                ...state,
                combatLog: [...state.combatLog, action.message],
            };
        }

        default:
            return state;
    }
}

interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    playCard: (cardId: string) => void;
    endTurn: () => void;
    startCombat: (enemy: Enemy) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const playCard = (cardId: string) => {
        dispatch({ type: "PLAY_CARD", cardId });
    };

    const endTurn = () => {
        dispatch({ type: "END_TURN" });
        // Auto-advance to next turn after a short delay
        setTimeout(() => {
            dispatch({ type: "ENEMY_ATTACK" });
        }, 1000);
    };

    const startCombat = (enemy: Enemy) => {
        dispatch({ type: "START_COMBAT", enemy });
    };

    return (
        <GameContext.Provider
            value={{ state, dispatch, playCard, endTurn, startCombat }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
}
