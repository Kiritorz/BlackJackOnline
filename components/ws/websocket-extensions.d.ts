import 'ws';

declare module 'ws' {
    interface WebSocket {
        uuid?: string;
    }
}
