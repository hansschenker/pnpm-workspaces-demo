import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { CounterSchema, type Counter } from '@jilles/schema'
import * as db from '@jilles/database'

const app = new Hono()

app.use('/*', cors())

app.get('/counter', (c) => {
    const counter: Counter = db.get()
    return c.json(counter)
})

app.post('/counter/increment', (c) => {
    return c.json(db.increment())
})

app.post('/counter/decrement', (c) => {
    return c.json(db.decrement())
})

app.post('/counter/reset', (c) => {
    return c.json(db.reset())
})

app.post('/counter/set', async (c) => {
    const body = await c.req.json()
    const result = CounterSchema.safeParse(body)

    if (!result.success) {
        return c.json({ error: 'Invalid counter value', issues: result.error.issues }, 400)
    }

    const newValue = db.set(result.data.value)

    return c.json(newValue)
})

serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
