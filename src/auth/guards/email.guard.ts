import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { RequestWithUser } from '../interfaces/requestWithUser.interface'

@Injectable()
export class EmailGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request: RequestWithUser = context.switchToHttp().getRequest()
        if (!request.user?.isEmailConfirmed)
            throw new HttpException('Confirm your email first', HttpStatus.UNAUTHORIZED)
        return true
    }
}
