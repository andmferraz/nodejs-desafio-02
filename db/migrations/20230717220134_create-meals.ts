import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary()
        table.uuid('session_id').index()
        table.text('name').notNullable()
        table.text('description').notNullable()
        table.boolean('is_valid').notNullable()
        table.timestamp('created_at').notNullable()
        table.uuid('user_id').references('id').inTable('users')
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}