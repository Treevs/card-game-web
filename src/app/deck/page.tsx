"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useMyCollectionQuery } from "@/generated/generates";
import { Card } from "@/app/_components/Card";
import type { CollectionCardFragment } from "@/generated/generates";

// Helper function to determine if a card is a hero
// This checks both the type field and subType array for hero identification
// Adjust this based on your actual backend schema if needed
function isHeroCard(card: CollectionCardFragment): boolean {
    // Check if type is "hero"
    if (card.type?.toLowerCase() === "hero") {
        return true;
    }
    // Check if subType contains "hero"
    if (card.subType?.some((t) => t?.toLowerCase().includes("hero"))) {
        return true;
    }
    return false;
}

interface DeckCard {
    cardId: string;
    quantity: number;
}

interface DeckState {
    id: string | null; // null for new deck
    name: string;
    heroCardId: string | null;
    cards: Map<string, number>; // cardId -> quantity
}

export default function DeckPage() {
    const { user, loading: authLoading } = useAuth();
    const { data, loading, error } = useMyCollectionQuery({
        skip: !user,
    });

    const [currentDeck, setCurrentDeck] = useState<DeckState>({
        id: null,
        name: "",
        heroCardId: null,
        cards: new Map(),
    });

    const [deckNameInput, setDeckNameInput] = useState("");
    const [savedDecks, setSavedDecks] = useState<DeckState[]>([]); // Will be populated from GraphQL query once backend is ready
    const [showDeckList, setShowDeckList] = useState(false);

    // Calculate deck statistics
    const deckStats = useMemo(() => {
        let totalCards = 0;
        let heroCount = 0;
        let supportCount = 0;
        const collectionCards = data?.me?.collection?.cards ?? [];

        currentDeck.cards.forEach((quantity, cardId) => {
            totalCards += quantity;
            const cardEntry = collectionCards.find(
                (ce) => ce.card.id === cardId
            );
            if (cardEntry && isHeroCard(cardEntry.card)) {
                heroCount += quantity;
            } else {
                supportCount += quantity;
            }
        });

        return { totalCards, heroCount, supportCount };
    }, [currentDeck.cards, data?.me?.collection?.cards]);

    // Validation
    const validation = useMemo(() => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (deckStats.totalCards !== 100) {
            errors.push(
                `Deck must have exactly 100 cards (currently ${deckStats.totalCards})`
            );
        }

        if (!currentDeck.heroCardId) {
            errors.push("You must select a hero for your deck");
        }

        // Check for duplicate heroes (max 1 of each hero)
        const collectionCards = data?.me?.collection?.cards ?? [];
        currentDeck.cards.forEach((quantity, cardId) => {
            const cardEntry = collectionCards.find(
                (ce) => ce.card.id === cardId
            );
            if (cardEntry && isHeroCard(cardEntry.card) && quantity > 1) {
                errors.push(
                    `You can only have 1 copy of each hero card (${cardEntry.card.name})`
                );
            }
        });

        const isValid = errors.length === 0;
        return { errors, warnings, isValid };
    }, [
        deckStats.totalCards,
        currentDeck.heroCardId,
        currentDeck.cards,
        data?.me?.collection?.cards,
    ]);

    // Add card to deck
    const addCardToDeck = (cardId: string) => {
        const collectionCards = data?.me?.collection?.cards ?? [];
        const cardEntry = collectionCards.find((ce) => ce.card.id === cardId);
        if (!cardEntry) return;

        const card = cardEntry.card;
        const isHero = isHeroCard(card);
        const currentQuantity = currentDeck.cards.get(cardId) ?? 0;

        // Check if adding a hero that's already in deck
        if (isHero && currentQuantity >= 1) {
            return; // Can't add more than 1 of each hero
        }

        // Check collection quantity
        if (currentQuantity >= cardEntry.quantity) {
            return; // Don't have enough in collection
        }

        setCurrentDeck((prev) => {
            const newCards = new Map(prev.cards);
            newCards.set(cardId, currentQuantity + 1);
            return { ...prev, cards: newCards };
        });
    };

    // Remove card from deck
    const removeCardFromDeck = (cardId: string) => {
        setCurrentDeck((prev) => {
            const newCards = new Map(prev.cards);
            const currentQuantity = newCards.get(cardId) ?? 0;
            if (currentQuantity <= 1) {
                newCards.delete(cardId);
                // If this was the hero, clear hero selection
                if (prev.heroCardId === cardId) {
                    return { ...prev, cards: newCards, heroCardId: null };
                }
            } else {
                newCards.set(cardId, currentQuantity - 1);
            }
            return { ...prev, cards: newCards };
        });
    };

    // Fill card to deck (adds as many as possible up to 100 cards)
    const fillCardToDeck = (cardId: string) => {
        const collectionCards = data?.me?.collection?.cards ?? [];
        const cardEntry = collectionCards.find((ce) => ce.card.id === cardId);
        if (!cardEntry) return;

        const card = cardEntry.card;
        const isHero = isHeroCard(card);

        // Only work with support cards (not heroes)
        if (isHero) {
            return;
        }

        const currentQuantity = currentDeck.cards.get(cardId) ?? 0;
        const remainingSlots = 100 - deckStats.totalCards;

        // If deck is already full, nothing to do
        if (remainingSlots <= 0) {
            return;
        }

        // Calculate how many we can add
        const availableInCollection = cardEntry.quantity - currentQuantity;
        const canAdd = Math.min(remainingSlots, availableInCollection);

        // If we can't add any, return
        if (canAdd <= 0) {
            return;
        }

        setCurrentDeck((prev) => {
            const newCards = new Map(prev.cards);
            newCards.set(cardId, currentQuantity + canAdd);
            return { ...prev, cards: newCards };
        });
    };

    // Set hero
    const setHero = (cardId: string) => {
        if (currentDeck.cards.has(cardId)) {
            setCurrentDeck((prev) => ({ ...prev, heroCardId: cardId }));
        }
    };

    // Save deck
    const handleSaveDeck = async () => {
        if (!validation.isValid || !deckNameInput.trim()) {
            return;
        }

        // Convert Map to array format
        const cardsArray: DeckCard[] = Array.from(
            currentDeck.cards.entries()
        ).map(([cardId, quantity]) => ({
            cardId,
            quantity,
        }));

        // TODO: Implement GraphQL mutations once backend is ready
        // if (currentDeck.id) {
        //     await updateDeckMutation({
        //         variables: {
        //             id: currentDeck.id,
        //             name: deckNameInput,
        //             heroCardId: currentDeck.heroCardId!,
        //             cards: cardsArray,
        //         },
        //     });
        // } else {
        //     await createDeckMutation({
        //         variables: {
        //             name: deckNameInput,
        //             heroCardId: currentDeck.heroCardId!,
        //             cards: cardsArray,
        //         },
        //     });
        // }

        // For now, just log
        console.log("Save deck:", {
            id: currentDeck.id,
            name: deckNameInput,
            heroCardId: currentDeck.heroCardId,
            cards: cardsArray,
        });

        // Create deck object for saved decks list
        const savedDeck: DeckState = {
            id: currentDeck.id || `deck-${Date.now()}`, // Temporary ID until backend provides one
            name: deckNameInput,
            heroCardId: currentDeck.heroCardId,
            cards: new Map(currentDeck.cards),
        };

        // Update saved decks list
        if (currentDeck.id) {
            // Update existing deck
            setSavedDecks((prev) =>
                prev.map((d) => (d.id === currentDeck.id ? savedDeck : d))
            );
        } else {
            // Add new deck
            setSavedDecks((prev) => [...prev, savedDeck]);
        }

        // Reset after save
        setCurrentDeck({
            id: null,
            name: "",
            heroCardId: null,
            cards: new Map(),
        });
        setDeckNameInput("");
    };

    // Create new deck
    const handleNewDeck = () => {
        setCurrentDeck({
            id: null,
            name: "",
            heroCardId: null,
            cards: new Map(),
        });
        setDeckNameInput("");
    };

    // Load deck
    const handleLoadDeck = (deck: DeckState) => {
        setCurrentDeck(deck);
        setDeckNameInput(deck.name);
        setShowDeckList(false);
    };

    // Delete deck
    const handleDeleteDeck = async (deckId: string) => {
        // TODO: Implement GraphQL delete mutation once backend is ready
        // await deleteDeckMutation({ variables: { id: deckId } });
        setSavedDecks((prev) => prev.filter((d) => d.id !== deckId));
        if (currentDeck.id === deckId) {
            handleNewDeck();
        }
    };

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Please log in to build decks
                    </h2>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Show loading state while fetching collection
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-white text-xl">
                    Loading your collection...
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">
                        Error loading collection
                    </h2>
                    <p className="text-gray-400 mb-4">{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const collectionCards = data?.me?.collection?.cards ?? [];

    // Show empty state
    if (collectionCards.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Your collection is empty
                    </h2>
                    <p className="text-gray-400">
                        Start playing to collect cards before building decks!
                    </p>
                </div>
            </div>
        );
    }

    // Get hero card for display
    const heroCard = currentDeck.heroCardId
        ? collectionCards.find((ce) => ce.card.id === currentDeck.heroCardId)
              ?.card
        : null;

    // Get deck cards for display
    const deckCardEntries = Array.from(currentDeck.cards.entries())
        .map(([cardId, quantity]) => {
            const cardEntry = collectionCards.find(
                (ce) => ce.card.id === cardId
            );
            return cardEntry ? { card: cardEntry.card, quantity } : null;
        })
        .filter(
            (
                entry
            ): entry is { card: CollectionCardFragment; quantity: number } =>
                entry !== null
        );

    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Deck Builder
                        </h1>
                        <p className="text-gray-400">
                            Build and manage your decks
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeckList(!showDeckList)}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm font-medium"
                    >
                        {showDeckList ? "Hide" : "Show"} Saved Decks (
                        {savedDecks.length})
                    </button>
                </div>

                {/* Deck List Sidebar */}
                {showDeckList && (
                    <div className="mb-6 bg-gray-800 rounded-lg p-4">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Saved Decks
                        </h2>
                        {savedDecks.length === 0 ? (
                            <p className="text-gray-400">
                                No saved decks yet. Create one to get started!
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedDecks.map((deck) => {
                                    const deckCardCount = Array.from(
                                        deck.cards.values()
                                    ).reduce((sum, qty) => sum + qty, 0);
                                    return (
                                        <div
                                            key={deck.id}
                                            className="bg-gray-700 p-4 rounded flex justify-between items-center"
                                        >
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold">
                                                    {deck.name}
                                                </h3>
                                                <p className="text-gray-400 text-sm">
                                                    {deckCardCount} cards
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleLoadDeck(deck)
                                                    }
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                                >
                                                    Load
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deck.id &&
                                                        handleDeleteDeck(
                                                            deck.id
                                                        )
                                                    }
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Deck Controls */}
                <div className="mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Deck Name
                        </label>
                        <input
                            type="text"
                            value={deckNameInput}
                            onChange={(e) => setDeckNameInput(e.target.value)}
                            placeholder="Enter deck name..."
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleNewDeck}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm font-medium"
                    >
                        New Deck
                    </button>
                    <button
                        onClick={handleSaveDeck}
                        disabled={!validation.isValid || !deckNameInput.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition-colors text-sm font-medium"
                    >
                        Save Deck
                    </button>
                </div>

                {/* Validation Messages */}
                {validation.errors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded">
                        <h3 className="text-red-400 font-bold mb-2">Errors:</h3>
                        <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                            {validation.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Deck Statistics */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-gray-400 text-sm">Total Cards</div>
                        <div className="text-2xl font-bold text-white">
                            {deckStats.totalCards}/100
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-gray-400 text-sm">Hero Cards</div>
                        <div className="text-2xl font-bold text-yellow-400">
                            {deckStats.heroCount}
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-gray-400 text-sm">
                            Support Cards
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                            {deckStats.supportCount}
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-gray-400 text-sm">Status</div>
                        <div
                            className={`text-lg font-bold ${
                                validation.isValid
                                    ? "text-green-400"
                                    : "text-red-400"
                            }`}
                        >
                            {validation.isValid ? "Valid" : "Invalid"}
                        </div>
                    </div>
                </div>

                {/* Selected Hero Display */}
                {heroCard && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-3">
                            Selected Hero
                        </h2>
                        <div className="inline-block">
                            <Card card={heroCard} isPlayable={false} />
                        </div>
                    </div>
                )}

                {/* Deck Cards */}
                {deckCardEntries.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Deck Cards ({deckCardEntries.length} unique)
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {deckCardEntries.map(({ card, quantity }) => {
                                const isHero = isHeroCard(card);
                                const isSelectedHero =
                                    card.id === currentDeck.heroCardId;
                                return (
                                    <div key={card.id} className="relative">
                                        <Card
                                            card={card}
                                            isPlayable={false}
                                            onClick={() => {
                                                if (isHero && !isSelectedHero) {
                                                    setHero(card.id);
                                                }
                                            }}
                                        />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-900">
                                            {quantity}
                                        </div>
                                        {isSelectedHero && (
                                            <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                                                HERO
                                            </div>
                                        )}
                                        <div className="mt-2 flex gap-2 justify-center">
                                            <button
                                                onClick={() =>
                                                    removeCardFromDeck(card.id)
                                                }
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                            >
                                                Remove
                                            </button>
                                            {isHero && !isSelectedHero && (
                                                <button
                                                    onClick={() =>
                                                        setHero(card.id)
                                                    }
                                                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                                                >
                                                    Set Hero
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Collection Grid */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                        Your Collection
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {collectionCards.map(
                            ({ card, quantity: collectionQuantity }) => {
                                const deckQuantity =
                                    currentDeck.cards.get(card.id) ?? 0;
                                const isHero = isHeroCard(card);
                                const canAdd =
                                    (!isHero || deckQuantity === 0) &&
                                    deckQuantity < collectionQuantity &&
                                    deckStats.totalCards < 100;
                                const isInDeck = deckQuantity > 0;

                                // Calculate if fill button should be enabled
                                const remainingSlots =
                                    100 - deckStats.totalCards;
                                const availableInCollection =
                                    collectionQuantity - deckQuantity;
                                const canFill =
                                    !isHero &&
                                    remainingSlots > 0 &&
                                    availableInCollection > 0;

                                return (
                                    <div key={card.id} className="relative">
                                        <Card
                                            card={card}
                                            isPlayable={canAdd}
                                            onClick={() => {
                                                if (canAdd) {
                                                    addCardToDeck(card.id);
                                                }
                                            }}
                                        />
                                        {/* Collection Quantity Badge */}
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-900">
                                            {collectionQuantity}
                                        </div>
                                        {/* In Deck Indicator */}
                                        {isInDeck && (
                                            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                In Deck ({deckQuantity})
                                            </div>
                                        )}
                                        {/* Hero Badge */}
                                        {isHero && (
                                            <div className="absolute bottom-2 left-2 bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold">
                                                HERO
                                            </div>
                                        )}
                                        {!canAdd &&
                                            isInDeck &&
                                            isHero &&
                                            deckQuantity >= 1 && (
                                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">
                                                        Max 1 per deck
                                                    </span>
                                                </div>
                                            )}
                                        {canFill && (
                                            <div className="mt-2 flex justify-center">
                                                <button
                                                    onClick={() =>
                                                        fillCardToDeck(card.id)
                                                    }
                                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors"
                                                    disabled={!canFill}
                                                >
                                                    Fill
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
