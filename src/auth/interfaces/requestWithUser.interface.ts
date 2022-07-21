import { FastifyRequest } from 'fastify'
import { User } from 'src/users/models/users.model'

export interface RequestWithUser extends FastifyRequest {
    user: User
}
