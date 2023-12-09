export interface Player {
    name: string;
    token: string;
    estimate: number | null;
    isOwner: boolean;
    id: string;
}

export interface ExportPlayer {
    name: string;
}

export interface ExportEstimatePlayer {
    name: string;
    id: string;
    estimate: number | null;
    isOwner: boolean;
}