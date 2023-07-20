import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from "../database"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

export async function usersRoutes(app: FastifyInstance) {
    app.get('/', async() => {
        const users = await knex('users')
            .select()

        return { users }
    })
    
    app.get('/:id', async (request) => {
        const getUserParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getUserParamsSchema.parse(request.params)

        const user = await knex('users')
            .where({ id }).first()

        return { user }
    })

    app.post('/', async (request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string(),
        })

        const { name, email } = createUserBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()
            
            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7
            })            
        }
        
        await knex('users').insert({
            id: randomUUID(),
            name,
            email,
            session_id: sessionId
        })

        return reply.status(201).send()
    })
}