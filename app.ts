import express from "express";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  // Liveness only: no database or WhatsApp integration exists yet.
  app.get("/health", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.status(200).json({ status: "ok", service: "kinova" });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
