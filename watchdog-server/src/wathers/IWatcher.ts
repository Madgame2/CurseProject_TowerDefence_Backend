

export interface IWatcher {
    name: string;
    run(): Promise<void>;
}