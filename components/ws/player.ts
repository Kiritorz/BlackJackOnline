interface Player {
    uuid: string;
    roomId: string;
}

export const players: Player[] = []

export function addPlayer(player: Player) {
    console.log('addPlayer', player)
    const pal = players.filter(p => p.roomId === player.roomId && p.uuid !== player.uuid)
    if (pal.length >= 2) return 'Room is full!'
    players.push(player)
    return pal.length === 1 ? pal[0] : 'Waiting for your friend to join...'
}

export function removePlayer(uuid: string) {
    console.log('removePlayer', uuid)
    const index = players.findIndex(p => p.uuid === uuid)
    if (index === -1) return
    players.splice(index, 1)
}

export function getPalUUID(uuid: string) {
    const roomId = players.find(p => p.uuid === uuid)?.roomId
    if (roomId === undefined) return null

    const pal = players.filter(p => p.uuid !== uuid && p.roomId === roomId)
    return pal.length === 1 ? pal[0].uuid : null
}