// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string
            name: string
            email: string
            created_at: string
            session_id?: string
        },
        meals: {
            id: string
            name: string
            description: string
            created_at: string
            is_valid: boolean
            user_id: string
            session_id?: string
        }
    }
}