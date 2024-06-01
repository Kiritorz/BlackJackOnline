import { isFindFriendsMessage, isNormalMessage } from '@/components/ws/client-message'
import { addPlayer, getPalUUID, removePlayer } from '@/components/ws/player'
import { v4 as uuidv4 } from 'uuid';

import { WebSocket, WebSocketServer } from 'ws';

// ws://localhost:3000/api/ws
export function SOCKET(
    client: WebSocket,
    request: import('http').IncomingMessage,
    server: WebSocketServer,
) {
    console.log('A client connected!')

    client.uuid = uuidv4();

    // 读取客户端发送的消息

    client.on('message', message => {
        // client.send(message)
        if (client.uuid === undefined) return

        // 匹配好友
        if (isFindFriendsMessage(message.toString())) {
            const result = addPlayer({
                // 获取每个 client 的唯一标识
                uuid: client.uuid,
                roomId: message.toString().slice(3)
            })
            if (typeof result === 'string') {
                client.send(new TextEncoder().encode(result))
            } else {
                // 通知此客户端和其伙伴
                const palUUID = result.uuid
                server.clients.forEach((c: WebSocket) => {
                    if (c.uuid === palUUID) {
                        if (c.readyState === c.OPEN) {
                            client.send(new TextEncoder().encode('Your friend has joined the room!'))
                            c.send(new TextEncoder().encode('Your friend has joined the room!'))
                        } else {
                            client.send(new TextEncoder().encode('Your friend is offline!'))
                        }
                    }
                })
            }
        }

        // 发送消息给好友
        if (isNormalMessage(message.toString())) {
            if (client.uuid === undefined) return
            const clientUUID = client.uuid
            const palUUID = getPalUUID(clientUUID)
            if (palUUID === null) {
                client.send(new TextEncoder().encode('You haven\'t matched a friend yet!'))
                return
            }

            server.clients.forEach((c: WebSocket) => {
                if (c.uuid === palUUID) {
                    if (c.readyState === c.OPEN) {
                        c.send(new TextEncoder().encode(message.toString().slice(40)))
                    } else {
                        client.send(new TextEncoder().encode('Your friend is offline!'))
                    }
                }
            })
        }
    })

    client.on('close', () => {
        if (client.uuid === undefined) return

        removePlayer(client.uuid)
        console.log('A client disconnected!')
    })
}