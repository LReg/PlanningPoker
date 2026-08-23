export interface Player {
    name: string;
    id: string;
    token: string;
    estimate: string | null;
    isOwner: boolean;
    // Drives the kick-warning/kick sweep (services/cleanupSweep.ts) — replaces what used to be
    // a pair of live setTimeout handles, which can't survive a session moving through Redis.
    lastAction: Date;
    // Set once the 55-minute warning fires, so the sweep doesn't re-send it every tick until the
    // 60-minute kick. Cleared whenever lastAction moves forward.
    warningIssued?: boolean;
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