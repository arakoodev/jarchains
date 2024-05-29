import "dotenv/config";
import { ArakooServer } from "@arakoodev/edgechains.js/arakooserver";
import { ChatRouter } from "./routes/chat.js";
const server = new ArakooServer();

const app = server.createApp();

app.route("/chatWithpdf", ChatRouter);

server.listen(3000);
