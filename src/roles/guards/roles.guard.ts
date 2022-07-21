import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'node_modules/rxjs/dist/types'
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface'
import { ROLES_KEY } from './roles-auth.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!requiredRoles) return true

        const request: RequestWithUser = context.switchToHttp().getRequest()

        if (!request.user?.user_roles.some((role) => requiredRoles.includes(role.value)))
            throw new UnauthorizedException('Access denied')

        return true
    }
}
