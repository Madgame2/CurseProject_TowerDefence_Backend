import { IEvent } from "./Events/iEvent";


export interface Notifier<T extends IEvent> {
    emit(event: T): Promise<void>;

    removeUserFromAllSubscriptions?(userId: string): void;
}