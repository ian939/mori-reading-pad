import { randomUUID } from "node:crypto";
import { join } from "node:path";
import express from "express";
import multer from "multer";
import { AnalyzerConfigurationError } from "./bookAnalyzer.js";
import {
  cleanIncomingFiles,
  removeBookImages,
  storeBookImages,
} from "./storage.js";

const terminalStatuses = new Set(["complete", "failed"]);

const publicBook = (book, { includeText = true } = {}) => {
  if (!book) return null;
  return {
    ...book,
    fullText: includeText ? book.fullText : undefined,
    pages: book.pages?.map(({ extractedText, storedFilename: _storedFilename, ...page }) => ({
      ...page,
      extractedText: includeText ? extractedText : undefined,
    })),
  };
};

export function createApp({ database, analyzer, incomingDirectory, uploadsDirectory, apiToken }) {
  const app = express();
  const upload = multer({
    dest: incomingDirectory,
    limits: { files: 40, fileSize: 18 * 1024 * 1024 },
    fileFilter(_request, file, callback) {
      callback(null, file.mimetype.startsWith("image/"));
    },
  });
  const activeJobs = new Set();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  app.use((request, response, next) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
    const origin = request.get("origin");
    if (origin && allowedOrigins.includes(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    }
    if (request.method === "OPTIONS") return response.sendStatus(204);
    return next();
  });

  const requireWriteAccess = (request, response, next) => {
    if (!apiToken) return next();
    if (request.get("authorization") === `Bearer ${apiToken}`) return next();
    return response.status(401).json({ error: "책 등록 권한이 필요합니다." });
  };

  const processBook = async (bookId) => {
    if (activeJobs.has(bookId)) return;
    const book = database.getBook(bookId);
    if (!book || terminalStatuses.has(book.status)) return;
    activeJobs.add(bookId);
    try {
      database.setStatus(bookId, "processing");
      const pages = database.getBook(bookId).pages.map((page) => ({
        ...page,
        absolutePath: join(
          uploadsDirectory,
          page.bookId,
          `page-${String(page.uploadIndex + 1).padStart(3, "0")}.jpg`,
        ),
      }));
      const analysis = await analyzer.analyze(pages);
      database.completeBook(bookId, analysis);
    } catch (error) {
      if (error instanceof AnalyzerConfigurationError) {
        database.setStatus(bookId, "needs_configuration", error.message);
      } else {
        console.error(`Book analysis failed (${bookId})`, error);
        database.setStatus(bookId, "failed", "책 이미지 분석 중 오류가 발생했습니다.");
      }
    } finally {
      activeJobs.delete(bookId);
    }
  };

  const scheduleBook = (bookId) => setImmediate(() => processBook(bookId));

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      analyzerConfigured: analyzer.configured,
      analyzerProvider: analyzer.provider,
      analyzerModel: analyzer.model,
    });
  });

  app.get("/api/books", (request, response) => {
    const limit = Math.min(Math.max(Number(request.query.limit) || 30, 1), 100);
    const offset = Math.max(Number(request.query.offset) || 0, 0);
    const result = database.listBooks({ limit, offset });
    response.json({
      ...result,
      books: result.books.map((book) => publicBook(book, { includeText: false })),
    });
  });

  app.get("/api/books/:id", (request, response) => {
    const book = database.getBook(request.params.id);
    if (!book) return response.status(404).json({ error: "등록된 책을 찾을 수 없습니다." });
    return response.json({ book: publicBook(book) });
  });

  app.post(
    "/api/books",
    requireWriteAccess,
    upload.array("pages", 40),
    async (request, response, next) => {
      const files = request.files || [];
      if (!files.length) {
        return response.status(400).json({ error: "책 이미지가 한 장 이상 필요합니다." });
      }

      const bookId = randomUUID();
      let imagesStored = false;
      try {
        const stored = await storeBookImages({ bookId, files, uploadsDirectory });
        imagesStored = true;
        const book = database.createBook({
          id: stored.bookId,
          provider: analyzer.provider,
          model: analyzer.model,
          pages: stored.pages,
        });
        scheduleBook(bookId);
        return response.status(202).json({ book: publicBook(book) });
      } catch (error) {
        await cleanIncomingFiles(files);
        if (imagesStored) await removeBookImages({ bookId, uploadsDirectory });
        return next(error);
      }
    },
  );

  app.post("/api/books/:id/reprocess", requireWriteAccess, (request, response) => {
    const book = database.getBook(request.params.id);
    if (!book) return response.status(404).json({ error: "등록된 책을 찾을 수 없습니다." });
    database.setStatus(book.id, "queued");
    scheduleBook(book.id);
    return response.status(202).json({ book: publicBook(database.getBook(book.id)) });
  });

  app.use((error, _request, response, _next) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "이미지 한 장은 18MB 이하여야 합니다."
          : error.code === "LIMIT_FILE_COUNT"
            ? "한 번에 최대 40장까지 등록할 수 있습니다."
            : "이미지 업로드 형식이 올바르지 않습니다.";
      return response.status(400).json({ error: message });
    }
    console.error(error);
    return response.status(500).json({ error: "책 등록 중 서버 오류가 발생했습니다." });
  });

  return {
    app,
    resumePending() {
      database.pendingBookIds().forEach(scheduleBook);
    },
  };
}
