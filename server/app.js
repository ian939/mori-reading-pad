import { randomUUID } from "node:crypto";
import { join } from "node:path";
import express from "express";
import multer from "multer";
import { AnalyzerConfigurationError } from "./bookAnalyzer.js";
import { CharacterGeneratorConfigurationError } from "./characterGenerator.js";
import {
  cleanIncomingFiles,
  pruneBookImages,
  removeBookImages,
  storeBookImages,
} from "./storage.js";

const terminalStatuses = new Set(["complete", "failed"]);

// The book's transcribed text is never stored, so responses only ever carry
// bibliographic facts and non-expressive page structure. The internal
// stored_filename is dropped so upload paths are not leaked to clients.
const publicBook = (book) => {
  if (!book) return null;
  return {
    ...book,
    pages: book.pages?.map(({ storedFilename: _storedFilename, ...page }) => page),
  };
};

export function createApp({
  database,
  analyzer,
  characterGenerator = {
    configured: false,
    provider: "none",
    model: null,
  },
  incomingDirectory,
  uploadsDirectory,
  apiToken,
}) {
  const app = express();
  const upload = multer({
    dest: incomingDirectory,
    limits: { files: 40, fileSize: 18 * 1024 * 1024 },
    fileFilter(_request, file, callback) {
      callback(null, file.mimetype.startsWith("image/"));
    },
  });
  const characterUpload = multer({
    dest: incomingDirectory,
    limits: { files: 1, fileSize: 12 * 1024 * 1024 },
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
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Mori-User-Id",
      );
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    }
    if (request.method === "OPTIONS") return response.sendStatus(204);
    return next();
  });

  // When MORI_API_TOKEN is set, both reads and writes require the bearer token
  // so a token-protected deployment keeps even bibliographic data private. With
  // no token configured (local dev), the API stays open.
  const requireToken = (request, response, next) => {
    if (!apiToken) return next();
    if (request.get("authorization") === `Bearer ${apiToken}`) return next();
    return response.status(401).json({ error: "이 책 API에 접근할 권한이 필요합니다." });
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
      // Keep only the first uploaded image (the cover) for the bookshelf; the
      // transcription lives only in memory and is discarded with `analysis`.
      const coverUploadIndex = 0;
      const coverPage = pages.find((page) => page.uploadIndex === coverUploadIndex);
      database.completeBook(bookId, analysis, {
        retainedUploadIndexes: [coverUploadIndex],
      });
      await pruneBookImages({
        bookId,
        uploadsDirectory,
        keepFilenames: coverPage ? [coverPage.storedFilename] : [],
      });
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
      characterGeneratorConfigured: characterGenerator.configured,
      characterGeneratorProvider: characterGenerator.provider,
      characterGeneratorModel: characterGenerator.model,
    });
  });

  app.post(
    "/api/characters/generate",
    requireToken,
    characterUpload.single("photo"),
    async (request, response) => {
      if (!request.file) {
        return response.status(400).json({ error: "아이 사진 한 장이 필요합니다." });
      }
      const userId = String(request.get("x-mori-user-id") || "local-user")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 64);
      let variants = null;
      let errorResponse = null;
      try {
        if (!characterGenerator.configured) {
          throw new CharacterGeneratorConfigurationError(
            "OPENAI_API_KEY가 없어 캐릭터를 만들 수 없습니다.",
          );
        }
        variants = await characterGenerator.generate(request.file, { userId });
      } catch (error) {
        if (error instanceof CharacterGeneratorConfigurationError) {
          errorResponse = { status: 503, message: error.message };
        } else if (error?.message?.includes("안전 확인")) {
          errorResponse = { status: 422, message: error.message };
        } else {
          console.error("Character generation failed", error);
          errorResponse = {
            status: 502,
            message:
              "캐릭터를 만드는 중 오류가 발생했습니다. 잠시 뒤 다시 시도해 주세요.",
          };
        }
      } finally {
        await cleanIncomingFiles([request.file]);
      }
      if (errorResponse) {
        return response
          .status(errorResponse.status)
          .json({ error: errorResponse.message });
      }
      return response.json({ variants });
    },
  );

  app.get("/api/books", requireToken, (request, response) => {
    const limit = Math.min(Math.max(Number(request.query.limit) || 30, 1), 100);
    const offset = Math.max(Number(request.query.offset) || 0, 0);
    const result = database.listBooks({ limit, offset });
    response.json({
      ...result,
      books: result.books.map((book) => publicBook(book)),
    });
  });

  app.get("/api/books/:id", requireToken, (request, response) => {
    const book = database.getBook(request.params.id);
    if (!book) return response.status(404).json({ error: "등록된 책을 찾을 수 없습니다." });
    return response.json({ book: publicBook(book) });
  });

  app.post(
    "/api/books",
    requireToken,
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

  app.post("/api/books/:id/reprocess", requireToken, (request, response) => {
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
          ? "이미지 용량 제한을 넘었어요. 아이 사진은 12MB, 책 사진은 한 장당 18MB 이하여야 합니다."
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
