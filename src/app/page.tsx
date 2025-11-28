import { GameProvider } from "@/contexts/GameContext";
import { GameBoard } from "@/app/_components/GameBoard";

export default function Home() {
    return (
        <GameProvider>
            <GameBoard />
        </GameProvider>
    );
}
