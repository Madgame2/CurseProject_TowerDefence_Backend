import { Injectable } from "@nestjs/common";
import { WSContext } from "../Types/WsContext";
import { ConnectionMiddleware } from "../Types/WsContext";

@Injectable()
export class WsMiddlewareRunner {

  async run(
    ctx: WSContext,
    middlewares: ConnectionMiddleware[]
  ) {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) return;
      index = i;

      const mw = middlewares[i];
      if (!mw) return;

      await mw.handle(ctx, () => dispatch(i + 1));
    };

    await dispatch(0);
  }
}