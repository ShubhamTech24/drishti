import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import os from "os";
import 'dotenv/config';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import pkg from "pg";

const { Pool } = pkg;

// ---------- PostgreSQL Pool ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Neon SSL
  },
});

// Export pool for use in other files
export { pool };

// ---------- Express App ----------
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---------- Logging Middleware ----------
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any;

  const originalJson = res.json;
  res.json = function (body) {
    capturedJsonResponse = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// ---------- Main Async Setup ----------
(async () => {
  // Register API routes
  const server = http.createServer(app);
  await registerRoutes(app);

  // ---------- Error Handling ----------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error("Server error:", err);
  });

  // ---------- Vite / Static Setup ----------
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ---------- Start Server ----------
  const port = parseInt(process.env.PORT || "5000", 10);

  const listenOptions: any = { port, host: "0.0.0.0" };
  if (os.platform() !== "win32") {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    log(`Server running on port ${port}`);
  });
})();
