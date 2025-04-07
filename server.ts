import { Application, Router, send } from "jsr:@oak/oak"
import * as path from "jsr:@std/path"

console.log("Resolved dist path:", path.join(Deno.cwd(), "dist"))

const app = new Application()
const router = new Router()

app.use(async (ctx, next) => {
  try {
    const filePath = ctx.request.url.pathname
    const isHashedFile = /assets/.test(filePath)
    const staticDir = path.join(Deno.cwd(), "dist")

    await send(ctx, filePath, {
      root: staticDir,
      immutable: isHashedFile,
      maxage: isHashedFile ? 31536000 : undefined,
      index: "index.html",
    })
  } catch (err) {
    await next()
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.use(async (ctx) => {
  try {
    await send(ctx, "index.html", {
      root: path.join(Deno.cwd(), "dist"),
    })
  } catch (err) {
    ctx.response.status = 404
    ctx.response.body = "Not Found"
  }
})

const isDev = Deno.env.get("DENO_ENV") === "development"
const port = isDev ? 8000 : undefined
console.log(`Server running on http://localhost:${port || ""}`)
await app.listen(isDev ? { port: Number(port) } : undefined)
