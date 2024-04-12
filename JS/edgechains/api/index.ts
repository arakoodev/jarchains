import { ArakooServer } from "@arakoodev/arakooserver";
import { StreamingRouter } from "./routes/Stream/streamingRouter.js";

const server = new ArakooServer();
const app = server.createApp()

app.route('/getStreamData', StreamingRouter)

server.listen(5000) // Default is 3000 
