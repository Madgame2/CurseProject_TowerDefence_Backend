

export class NotAllowPlayerException extends Error{
    constructor(message: string) {
        super(message);
        this.name = "NotAllowPlayerException";
    }
}