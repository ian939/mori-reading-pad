import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createBookAnalyzer } from "./bookAnalyzer.js";
import { createDatabase } from "./database.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = resolve(process.env.MORI_DATA_DIR || join(projectRoot, "data"));
const uploadsDirectory = join(dataDirectory, "uploads");
const incomingDirectory = join(dataDirectory, "incoming");
const databasePath = resolve(process.env.MORI_DATABASE_PATH || join(dataDirectory, "mori.sqlite"));
const port = Number(process.env.PORT || 8787);

mkdirSync(uploadsDirectory, { recursive: true });
mkdirSync(incomingDirectory, { recursive: true });

const database = createDatabase(databasePath);
const analyzer = createBookAnalyzer();
const { app, resumePending } = createApp({
  database,
  analyzer,
  incomingDirectory,
  uploadsDirectory,
  apiToken: process.env.MORI_API_TOKEN,
});

const server = app.listen(port, () => {
  console.log(`Mori book API listening on http://localhost:${port}`);
  console.log(
    analyzer.configured
      ? `Image analysis ready (${analyzer.model})`
      : "Image analysis is waiting for OPENAI_API_KEY",
  );
  resumePending();
});

const shutdown = () => {
  server.close(() => {
    database.close();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
