import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { parse } from "cookie";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { serveStatic, setupVite } from "./vite";
import { mernApi } from "../mern/api";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use((req, _res, next) => { (req as any).cookies = parse(req.headers.cookie ?? ""); next(); });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api", mernApi);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
