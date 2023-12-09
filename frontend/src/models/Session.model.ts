import type {ExportEstimatePlayer, Player} from "@/models/Player.model";

export interface Session {
    token: string;
    name: string;
    players: Player[];
    // open = true -> everyone can see the estimates
    open: boolean;
}
export interface ExportEstimateSession {
    token: string;
    name: string;
    players: ExportEstimatePlayer[];
    open: boolean;
}