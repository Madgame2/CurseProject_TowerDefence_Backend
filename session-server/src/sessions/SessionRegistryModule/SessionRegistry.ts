import { Injectable } from "@nestjs/common";
import { Session } from "src/types/session";


@Injectable()
export class SessionRegistry {
  private sessions = new Map<string, Session>();

  set(session: Session) {
    this.sessions.set(session.SessionID, session);
  }

  get(id: string) {
    return this.sessions.get(id);
  }

  remove(id: string) {
    this.sessions.delete(id);
  }
}