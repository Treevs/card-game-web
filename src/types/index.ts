export interface Card {
    id: string;
    name: string;
    cost: number;
    damage?: number;
    block?: number;
    description: string;
    type: "attack" | "skill" | "power";
    rarity: "common" | "uncommon" | "rare";
    effects?: CardEffect[];
    creatureHp?: number;
    creatureAttack?: number;
}

export interface CardEffect {
    type: "vulnerable" | "weak" | "strength" | "dexterity";
    value: number;
    duration?: number;
}

export interface Enemy {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    intent: EnemyIntent;
    damage?: number;
    block?: number;
    effects?: CardEffect[];
}

export interface EnemyIntent {
    type: "attack" | "block" | "buff" | "debuff";
    value: number;
    description: string;
}

export interface Creature {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    cardId: string;
}

export interface Player {
    hp: number;
    maxHp: number;
    energy: number;
    maxEnergy: number;
    block: number;
    deck: Card[];
    hand: Card[];
    drawPile: Card[];
    discardPile: Card[];
    effects?: CardEffect[];
    creatures: Creature[];
}

export interface GameState {
    player: Player;
    enemy: Enemy | null;
    turn: number;
    phase: "PLAYER_TURN" | "ENEMY_TURN" | "COMBAT_END";
    combatLog: string[];
}

export type GameAction =
    | { type: "PLAY_CARD"; cardId: string; targetId?: string }
    | { type: "END_TURN" }
    | { type: "DRAW_CARDS"; amount: number }
    | { type: "ENEMY_ATTACK" }
    | { type: "START_COMBAT"; enemy: Enemy }
    | { type: "DEAL_DAMAGE"; target: "player" | "enemy"; amount: number }
    | { type: "APPLY_BLOCK"; target: "player" | "enemy"; amount: number }
    | { type: "ADD_EFFECT"; target: "player" | "enemy"; effect: CardEffect }
    | { type: "REMOVE_EFFECT"; target: "player" | "enemy"; effectType: string }
    | { type: "ADD_LOG"; message: string };
