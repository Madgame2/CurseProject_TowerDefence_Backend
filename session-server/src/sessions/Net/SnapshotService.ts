import { Session } from "src/types/session";

export class SnapshotService {

    constructor(private session: Session) {}

    broadcast() {
        const world = this.session.world;

        const snapshot = {
            players: world.getAllPlayers().map(p => ({
                id: p.id,
                x: p.position.x,
                y: p.position.y,
                z: p.position.z
            }))
        };

        const data = JSON.stringify(snapshot);

        for (const client of this.session.getClients()) {
            client.ws.send(data);
        }
    }
}