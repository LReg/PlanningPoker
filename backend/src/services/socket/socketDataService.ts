export const socketPlayers: { [key: string]: string } = {};

export function getPlayerTokenFromSocketId(socketId: string) {
    return Object.keys(socketPlayers).find(key => socketPlayers[key] == socketId)
}

export function storePlayerToken(playerToken: string, socketId: string) {
    socketPlayers[playerToken] = socketId;
}