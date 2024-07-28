import {ExportEstimatePlayer, ExportPlayer, Player} from "./PlayerModel";

export interface Session {
    token: string;
    name: string;
    players: Player[];
    // open = true -> everyone can see the estimates
    open: boolean;
}

export interface NewSessionDto {
    name: string;
    leaderName: string;
}

export interface ExportSession {
    token: string;
    name: string;
    players: ExportPlayer[];
    open: boolean;
}

export interface ExportEstimateSession {
    token: string;
    name: string;
    players: ExportEstimatePlayer[];
    open: boolean;
}