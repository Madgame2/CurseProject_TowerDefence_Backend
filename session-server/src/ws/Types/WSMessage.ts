
export type WSMessage <T = any> ={
    action: string;
    payload: T;
    requestId?: string;
}