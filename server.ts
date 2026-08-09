import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import { app } from "./api/index";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Screenshot to Action Server running at http://localhost:${PORT}`);
    console.log(`🤖 AI Provider: Hugging Face Vision AI (Vercel Ready)`);
  });
}

startServer();


