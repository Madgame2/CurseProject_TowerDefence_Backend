export class ActionDispatcher {
    private handlers = new Map<string, ((player: any, payload: any) => void)[]>();

    on(action: string, handler: (player: any, payload: any) => void) {
        const arr = this.handlers.get(action) || [];
        arr.push(handler);
        this.handlers.set(action, arr);
    }

    dispatch(player: any, action: string, payload: any) {
        const handlers = this.handlers.get(action);
        if (!handlers) return;

        for (const h of handlers) {
            h(player, payload);
        }
    }
}