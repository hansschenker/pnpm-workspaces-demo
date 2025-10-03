import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as db from '@jilles/database'

const app = new Hono()

app.use('/*', cors())

app.get('/counter', (c) => {
  return c.json(db.get())
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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
