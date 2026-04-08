


class SessionBuffer {
    private _sessions = new Map<string, { userId: string; expiresAt: number }>();
    private _TTLChecker: NodeJS.Timeout | null = null;

    public addSession(sessionId: string, userId: string, ttlMs: number) {
        this._sessions.set(sessionId, {
            userId,
            expiresAt: Date.now() + ttlMs
        });
    }

    public getSession(sessionId: string) {
        const bufferedSession = this._sessions.get(sessionId);

        if (!bufferedSession) return null;

        if (bufferedSession.expiresAt < Date.now()) {
            this._sessions.delete(sessionId);
            return null;
        }

        return bufferedSession;
    }

    public startCleanup(intervalMs: number = 60_000) {
        if (this._TTLChecker) {
            clearInterval(this._TTLChecker);
        }

        this._TTLChecker = setInterval(() => {
            const now = Date.now();

            for (const [sessionId, session] of this._sessions) {
                if (session.expiresAt < now) {
                    this._sessions.delete(sessionId);
                }
            }
        }, intervalMs);
    }
}


export const sessionBuffer = new SessionBuffer();