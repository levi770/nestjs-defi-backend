import { Role } from 'src/roles/models/roles.model'

export interface TokenPayload {
    userId: string
    isSecondFactorAuthenticated?: boolean
    user_roles: Role[]
}
