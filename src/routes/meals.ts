import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { describe } from 'node:test'

export async function mealsRoutes(app: FastifyInstance) {
    app.get('/', {
        preHandler: [checkSessionIdExists]
    }, async(request) => {
        const { sessionId } = request.cookies       

        const meals = await knex('meals')
            .where('session_id', sessionId)
            .select()

        return { meals }
    })

    app.get('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealParamsSchema.parse(request.params)

        const { sessionId } = request.cookies

        const meal = await knex('meals')
            .where({
                session_id: sessionId,
                id
            }).first()

        return { meal }
    })

    app.post('/', async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),            
            is_valid: z.boolean(),
            created_at: z.string(),
            user_id: z.string()
        })

        const { name, description, is_valid, created_at, user_id } = createMealBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()
            
            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7
            })            
        }

        await knex('meals').insert({
            id: randomUUID(),
            name,
            description,            
            is_valid,
            created_at,
            user_id,
            session_id: sessionId
        })

        return reply.status(201).send()
    })

    app.put('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealParamsSchema.parse(request.params)

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_valid: z.boolean(),
            created_at: z.string(),
        })

        const { name, description, is_valid, created_at } = createMealBodySchema.parse(request.body)
        
        const { sessionId } = request.cookies

        await knex('meals').update({
            name,
            description,            
            is_valid,
            created_at
        })
        .where({
            id,
            session_id: sessionId
        })

        return reply.status(201).send()
    })

    app.delete('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealParamsSchema.parse(request.params)

        const { sessionId } = request.cookies

        await knex('meals').delete()
        .where({
            id,
            session_id: sessionId
        })

        return reply.status(201).send()
    })

    app.get('/summary', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies

        const summary = await knex('meals')
        .select(
          knex.raw(
            'count(*) filter (where is_valid = true) as totalMealsInside'
          ),
          knex.raw(
            'count(*) filter (where is_valid = false) as totalMealsOutside'
          ),
          knex.raw('count(*) as total')
        )
        .where({ 
            session_id: sessionId
        })

        return { summary }
    })
}