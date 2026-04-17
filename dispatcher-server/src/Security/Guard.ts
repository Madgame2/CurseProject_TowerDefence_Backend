import { CanActivate, Injectable, ExecutionContext, ForbiddenException  } from "@nestjs/common";


@Injectable()
export class InternalGuard  implements CanActivate{
     canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        const key = request.headers['x-internal-key'];
            
        if (!key || key !== process.env.INTERNAL_KEY) {
            throw new ForbiddenException('Access denied');
        }

        return true;
     }
}