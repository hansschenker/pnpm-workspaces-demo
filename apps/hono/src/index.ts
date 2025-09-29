import { Hono } from "hono";
import { cors } from "hono/cors";
import { create, getAll } from "@jilles/database";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("/*", cors());

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

app.get("/todos", (c) => {
  const todos = getAll();
  return c.json(todos);
});

app.post("/todos", async (c) => {
  const body = await c.req.json();
  const todo = create(body);
  return c.json(todo);
});

export default app;
