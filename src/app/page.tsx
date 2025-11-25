import { GameProvider } from "@/contexts/GameContext";
import { GameBoard } from "@/components/GameBoard";

export default function Home() {
    return (
        <GameProvider>
            <GameBoard />
        </GameProvider>
    );
}
