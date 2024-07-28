export interface Player {
    name: string;
    id: string;
    token: string;
    estimate: string | null;
    isOwner: boolean;
    lastAction: Date;
    timeoutIds: NodeJS.Timeout[];
}

export interface ExportPlayer {
    name: string;
    id: string;
    isOwner: boolean;
}

export interface ExportEstimatePlayer {
    name: string;
    id: string;
    estimate: string | null;
    isOwner: boolean;
}