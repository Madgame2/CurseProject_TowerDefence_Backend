import { Injectable } from "@nestjs/common";
import { SessionState } from "src/types/SessionState.enum";
import { Session } from "src/types/session";


export class SessionStateMachine{


    constructor(private session:Session){}

    private handlers: Partial<
        Record<SessionState, Record<string, (session: Session) => void>>
        > = {};
    private eventQueue: Array<{ session: Session; event: string }> = [];
    private processing = false;

    private onEnter: Partial<Record<SessionState, (session: Session) => void>> = {};
    private onExit: Partial<Record<SessionState, (session: Session) => void>> = {};

    private onStateChange: ((session: Session, from: SessionState, to: SessionState) => void)[] = [];

    registerHandler(
        state: SessionState,
        event: string,
        cb: (session: Session) => void
    ) {
        if (!this.handlers[state]) {
            this.handlers[state] = {};
        }

        this.handlers[state]![event] = cb;
    }

    registerOnStateChange(cb: (session: Session, from: SessionState, to: SessionState) => void) {
        this.onStateChange.push(cb);
    }

    handle(session: Session, event: string) {
        queueMicrotask(() => {
            this.eventQueue.push({ session, event });
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.processing) return;

        this.processing = true;

        while (this.eventQueue.length > 0) {
            const { session, event } = this.eventQueue.shift()!;

            const state = session.SessionState;

            const handler = this.handlers[state]?.[event];

            if (handler) {
                handler(session);
            }
        }

        this.processing = false;
    }

    registerOnEnter(state: SessionState, cb: (session: Session) => void) {
        this.onEnter[state] = cb;
    }

    registerOnExit(state: SessionState, cb: (session: Session) => void) {
        this.onExit[state] = cb;
    }



    transition(session: Session, next: SessionState) {
        if (!this.canTransition(session.SessionState, next)) {
            throw new Error('Invalid transition');
        }

        const current = session.SessionState;
        this.onExit[current]?.(session);

        session.SessionState = next;

        this.onEnter[next]?.(session);

        this.onStateChange.forEach(cb => cb(session, current, next));
  }

    private canTransition(from: SessionState, to: SessionState): boolean {
    const map = {
      NONE: ["CREATING"],
      CREATING: ['STARTING',"CANCELED"],
      STARTING: ['RUNNING', "CANCELED"],
      RUNNING: ['FINISHED', "CANCELED"],
      FINISHED: [],
      CANCELED: [],
    };

    return map[from]?.includes(to);
  }

}