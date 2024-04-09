import { ArakooServer } from "../arakooserver/index.js"
import { UploadPdfRouter } from "./routes/uploadPdf/uploadPdf.js"
import { uploadToSupabaseRouter } from "./routes/uploadToSupabase/uploadToSupabase.js";
import cluster from "node:cluster"
import os from "node:os";

const totalCPUs = os.cpus().length;
const server = new ArakooServer();


if (cluster.isPrimary) {

  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died from some region`);
  });

} else {
  const app = server.createApp();

  app.get("/", (c) => {
    return c.text("Hello, from Arakoo");
  });

  app.route("/v1/uploadPdf", UploadPdfRouter);
  app.route("/v1/vectorUpload", uploadToSupabaseRouter);

  server.listen(5000)
}


