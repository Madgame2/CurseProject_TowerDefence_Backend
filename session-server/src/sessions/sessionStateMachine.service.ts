import { Injectable } from "@nestjs/common";
import { SessionState } from "src/types/SessionState.enum";
import { Session } from "src/types/session";

@Injectable()
export class SessionStateMachine{

    private onEnter: Partial<Record<SessionState, (session: Session) => void>> = {};
    private onExit: Partial<Record<SessionState, (session: Session) => void>> = {};

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
  }

    private canTransition(from: SessionState, to: SessionState): boolean {
    const map = {
      CREATED: ['WAITING'],
      WAITING: ['RUNNING'],
      RUNNING: ['FINISHED'],
      FINISHED: [],
    };

    return map[from]?.includes(to);
  }

}