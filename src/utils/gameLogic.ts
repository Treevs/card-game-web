import { Card, Player, Enemy, CardEffect, Creature } from "@/types";

export const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const drawCards = (
    player: Player,
    amount: number
): { player: Player; drawnCards: Card[] } => {
    const drawnCards: Card[] = [];
    const newHand = [...player.hand];
    const newDrawPile = [...player.drawPile];

    for (let i = 0; i < amount && newDrawPile.length > 0; i++) {
        const card = newDrawPile.pop()!;
        drawnCards.push(card);
        newHand.push(card);
    }

    return {
        player: {
            ...player,
            hand: newHand,
            drawPile: newDrawPile,
        },
        drawnCards,
    };
};

export const dealDamage = (
    target: Player | Enemy,
    amount: number
): Player | Enemy => {
    const block = "block" in target ? target.block : 0;
    const actualDamage = Math.max(0, amount - block);
    const newHp = Math.max(0, target.hp - actualDamage);

    return {
        ...target,
        hp: newHp,
        block: Math.max(0, block - amount),
    };
};

export const applyBlock = (
    target: Player | Enemy,
    amount: number
): Player | Enemy => {
    return {
        ...target,
        block: (target.block || 0) + amount,
    };
};

export const addEffect = (
    target: Player | Enemy,
    effect: CardEffect
): Player | Enemy => {
    const currentEffects = target.effects || [];
    const existingEffectIndex = currentEffects.findIndex(
        (e) => e.type === effect.type
    );

    let newEffects: CardEffect[];
    if (existingEffectIndex >= 0) {
        newEffects = [...currentEffects];
        newEffects[existingEffectIndex] = {
            ...newEffects[existingEffectIndex],
            value: newEffects[existingEffectIndex].value + effect.value,
        };
    } else {
        newEffects = [...currentEffects, effect];
    }

    return {
        ...target,
        effects: newEffects,
    };
};

export const processCardEffects = (
    card: Card,
    target: Player | Enemy
): Player | Enemy => {
    if (!card.effects) return target;

    let result = target;
    for (const effect of card.effects) {
        result = addEffect(result, effect);
    }
    return result;
};

export const canPlayCard = (card: Card, player: Player): boolean => {
    return player.energy >= card.cost;
};

export const summonCreature = (card: Card): Creature | null => {
    if (card.creatureHp && card.creatureAttack) {
        return {
            id: `${card.id}-${Date.now()}-${Math.random()}`,
            name: card.name,
            hp: card.creatureHp,
            maxHp: card.creatureHp,
            attack: card.creatureAttack,
            cardId: card.id,
        };
    }
    return null;
};

export const creatureAttack = (
    creatures: Creature[],
    enemy: Enemy
): { enemy: Enemy; totalDamage: number } => {
    let totalDamage = 0;
    let newEnemy = { ...enemy };

    for (const creature of creatures) {
        const beforeHp = newEnemy.hp;
        newEnemy = dealDamage(newEnemy, creature.attack);
        totalDamage += beforeHp - newEnemy.hp;
    }

    return { enemy: newEnemy, totalDamage };
};

export const dealDamageToCreatures = (
    player: Player,
    amount: number
): { player: Player; remainingDamage: number; creaturesKilled: number } => {
    let remainingDamage = amount;
    const newCreatures = [...player.creatures];
    let creaturesKilled = 0;

    // Damage creatures left to right
    for (let i = 0; i < newCreatures.length && remainingDamage > 0; i++) {
        const creature = newCreatures[i];
        const damageToCreature = Math.min(remainingDamage, creature.hp);
        newCreatures[i] = {
            ...creature,
            hp: creature.hp - damageToCreature,
        };
        remainingDamage -= damageToCreature;

        // Remove dead creatures
        if (newCreatures[i].hp <= 0) {
            creaturesKilled++;
        }
    }

    // Remove dead creatures
    const aliveCreatures = newCreatures.filter((c) => c.hp > 0);

    // Apply remaining damage to player
    const newPlayer = {
        ...player,
        creatures: aliveCreatures,
    };

    if (remainingDamage > 0) {
        const beforeHp = newPlayer.hp;
        const playerWithDamage = dealDamage(newPlayer, remainingDamage);
        return {
            player: playerWithDamage,
            remainingDamage: 0,
            creaturesKilled,
        };
    }

    return {
        player: newPlayer,
        remainingDamage: 0,
        creaturesKilled,
    };
};

export const playCard = (
    card: Card,
    player: Player,
    target: Player | Enemy
): {
    player: Player;
    target: Player | Enemy;
    damageDealt?: number;
    blockGained?: number;
    creatureSummoned?: Creature;
} => {
    if (!canPlayCard(card, player)) {
        throw new Error("Not enough energy to play this card");
    }

    let newPlayer = {
        ...player,
        energy: player.energy - card.cost,
        hand: player.hand.filter((c) => c.id !== card.id),
        discardPile: [...player.discardPile, card],
        creatures: [...(player.creatures || [])],
    };

    let newTarget = target;
    let damageDealt: number | undefined;
    let blockGained: number | undefined;
    let creatureSummoned: Creature | undefined;

    // For attack cards with creature stats, summon a creature instead of dealing damage
    if (card.type === "attack" && card.creatureHp && card.creatureAttack) {
        const creature = summonCreature(card);
        if (creature) {
            newPlayer.creatures.push(creature);
            creatureSummoned = creature;
        }
    } else {
        // Apply damage for non-creature cards
        if (card.damage) {
            const beforeHp = target.hp;
            newTarget = dealDamage(target, card.damage);
            damageDealt = beforeHp - newTarget.hp;
        }
    }

    // Apply block to player
    if (card.block && "maxHp" in player) {
        newPlayer.block += card.block;
        blockGained = card.block;
    }

    // Apply effects
    newTarget = processCardEffects(card, newTarget);

    return {
        player: newPlayer,
        target: newTarget,
        damageDealt,
        blockGained,
        creatureSummoned,
    };
};

export const createStarterDeck = (): Card[] => {
    const deck: Card[] = [];

    // Add 5 Strikes
    for (let i = 0; i < 5; i++) {
        deck.push({
            id: `strike-${i}`,
            name: "Strike",
            cost: 1,
            damage: 6,
            description: "Summon a creature with 5 HP that attacks for 6 damage each turn.",
            type: "attack",
            rarity: "common",
            creatureHp: 5,
            creatureAttack: 6,
        });
    }

    // Add 4 Defends
    for (let i = 0; i < 4; i++) {
        deck.push({
            id: `defend-${i}`,
            name: "Defend",
            cost: 1,
            block: 5,
            description: "Gain 5 block.",
            type: "skill",
            rarity: "common",
        });
    }

    // Add 1 Bash
    deck.push({
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
    });

    return shuffleDeck(deck);
};
