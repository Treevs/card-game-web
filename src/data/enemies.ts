import { Enemy } from "@/types";

export const basicEnemies: Enemy[] = [
    {
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
    },
    {
        id: "jaw-worm",
        name: "Jaw Worm",
        hp: 40,
        maxHp: 40,
        intent: {
            type: "attack",
            value: 11,
            description: "Attacks for 11 damage",
        },
        damage: 11,
    },
];

export const getEnemyById = (id: string): Enemy | undefined => {
    return basicEnemies.find((enemy) => enemy.id === id);
};

export const createEnemy = (enemy: Enemy): Enemy => ({
    ...enemy,
    hp: enemy.maxHp,
    block: 0,
    effects: [],
});
