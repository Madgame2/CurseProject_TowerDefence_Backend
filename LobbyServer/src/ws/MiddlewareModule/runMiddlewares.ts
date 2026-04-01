import { WSContext } from "../types/WSContext";
import { ConnectionMiddleware } from "../types/WSContext";

export async function runMiddlewares(ctx: WSContext, middlewares: ConnectionMiddleware[]) {
    let index = -1;

    async function next() {
        index++;
        if (index < middlewares.length) {
            await middlewares[index]!(ctx, next); 
        }
    }

    await next();
}