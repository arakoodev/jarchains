import { ArakooServer } from "@arakoodev/arakooserver";
import cluster from "node:cluster"
import os from "node:os";

import { StreamingRouter } from "./routes/streaming/streamingRouter.js";
import { UploadPdfRouter } from "./routes/uploadPdf/uploadPdf.js"
import { uploadToSupabaseRouter } from "./routes/uploadToSupabase/uploadToSupabase.js";
import { cors } from "hono/cors"

const totalCPUs = os.cpus().length;
const server = new ArakooServer();

const app: any = server.createApp();

app.use(cors({ origin: "*" }))
if (cluster.isPrimary) {

  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died from some region`);
  });

} else {

  app.get("/", (c) => {
    return c.text("Hello, from Arakoo");
  });
  app.route("/api/v1/uploadPdf", UploadPdfRouter);
  app.route("/api/v1/vectorUpload", uploadToSupabaseRouter);
  app.route('/api/v1/getStreamData', StreamingRouter)

  server.listen(5000)

}

export default app;

