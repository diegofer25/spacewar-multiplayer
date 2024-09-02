import * as Colyseus from 'colyseus.js';

let roomsManager: RoomsManager;

class RoomsManager {
    private _client?: Colyseus.Client;
    private _rooms: Map<string, Colyseus.Room> = new Map();

    constructor(connectionUrl: string) {
        this._client = new Colyseus.Client(connectionUrl);
    }

    public getRoom<T>(roomName: string) {
        const room = this._rooms.get(roomName);
        if (!room) {
            throw new Error(`Room ${roomName} does not exist`);
        }

        return room as Colyseus.Room<T>;
    }

    public async joinRoom(roomName: string, options: Colyseus.JoinOptions): Promise<void> {
        if (!this._client) {
            throw new Error('Client is not initialized');
        }

        try {
            if (this._rooms.has(roomName)) {
                throw new Error(`Room ${roomName} already exists`);
            }

            const room = await this._client.joinOrCreate(roomName, options);
            this._rooms.set(roomName, room);
        } catch (e) {
            throw new Error(`Failed to join room: ${e}`);
        }
    }

    public onRoomStateChange<T>(roomName: string, callback: (state: T) => void): void {
        const room = this._rooms.get(roomName);
        if (!room) {
            throw new Error(`Room ${roomName} does not exist`);
        }

        room.onStateChange(callback);
    }

    public onRoomMessage<T>(
        roomName: string,
        messageType: string,
        callback: (data: T) => void,
    ): void {
        const room = this._rooms.get(roomName);
        if (!room) {
            throw new Error(`Room ${roomName} does not exist`);
        }

        room.onMessage(messageType, data => {
            callback(data);
        });
    }

    public sendMessage(roomName: string, messageType: string, message: unknown): void {
        const room = this._rooms.get(roomName);
        if (!room) {
            throw new Error(`Room ${roomName} does not exist`);
        }

        room.send(messageType, message);
    }
}

export function getRoomsManager() {
    if (!roomsManager && typeof process.env.WEBSOCKET_SERVER_URL === 'string') {
        roomsManager = new RoomsManager(process.env.WEBSOCKET_SERVER_URL);
    }

    return roomsManager;
}
