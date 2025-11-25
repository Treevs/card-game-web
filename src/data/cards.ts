import { Card } from "@/types";

export const starterCards: Card[] = [
    {
        id: "strike",
        name: "Strike",
        cost: 1,
        damage: 6,
        description: "Summon a creature with 5 HP that attacks for 6 damage each turn.",
        type: "attack",
        rarity: "common",
        creatureHp: 5,
        creatureAttack: 6,
    },
    {
        id: "defend",
        name: "Defend",
        cost: 1,
        block: 5,
        description: "Gain 5 block.",
        type: "skill",
        rarity: "common",
    },
    {
        id: "bash",
        name: "Bash",
        cost: 2,
        damage: 8,
        description: "Summon a creature with 8 HP that attacks for 8 damage each turn. Apply 2 vulnerable.",
        type: "attack",
        rarity: "common",
        creatureHp: 8,
        creatureAttack: 8,
        effects: [
            {
                type: "vulnerable",
                value: 2,
                duration: 2,
            },
        ],
    },
];

export const getCardById = (id: string): Card | undefined => {
    return starterCards.find((card) => card.id === id);
};

export const createCard = (card: Card): Card => ({
    ...card,
});
