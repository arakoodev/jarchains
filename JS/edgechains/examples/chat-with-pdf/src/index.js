import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ChatRouter } from "./chat.js";
const app = new Hono();
app.route("/", ChatRouter);
serve(app, () => {
    console.log("server running on port 3000");
});
