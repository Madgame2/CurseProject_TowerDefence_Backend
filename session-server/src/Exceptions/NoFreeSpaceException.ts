

export class NoFreeSpaceException extends Error{
    constructor(message: string) {
        super(message);
        this.name = "NoFreeSpaceException";
    }
}