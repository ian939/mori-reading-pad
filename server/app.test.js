import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { createApp } from "./app.js";
import { createDatabase } from "./database.js";

const waitFor = async (check, timeout = 3000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const result = await check();
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  throw new Error("Timed out waiting for book analysis");
};

test("uploaded book images are analyzed and stored page-by-page", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "mori-book-api-"));
  const incomingDirectory = join(root, "incoming");
  const uploadsDirectory = join(root, "uploads");
  await mkdir(incomingDirectory, { recursive: true });
  await mkdir(uploadsDirectory, { recursive: true });

  const database = createDatabase(join(root, "test.sqlite"));
  const analyzer = {
    configured: true,
    provider: "test",
    model: "fixture",
    async analyze(pages) {
      return {
        title: "테스트 책",
        subtitle: null,
        authors: "김작가",
        illustrators: "이그림",
        translators: null,
        publisher: "모리출판",
        isbn: "9781234567890",
        publicationDate: "2026-08-31",
        language: "ko",
        description: null,
        fullText: "[업로드 1]\n테스트 본문",
        pages: pages.map((page) => ({
          uploadIndex: page.uploadIndex,
          printedPage: page.uploadIndex === 0 ? null : String(page.uploadIndex),
          pageKind: page.uploadIndex === 0 ? "cover" : "story",
          text: page.uploadIndex === 0 ? "테스트 책" : "테스트 본문",
        })),
      };
    },
  };
  const { app } = createApp({
    database,
    analyzer,
    incomingDirectory,
    uploadsDirectory,
  });
  const server = app.listen(0);

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    database.close();
    await rm(root, { recursive: true, force: true });
  });

  const address = server.address();
  const image = await sharp({
    create: { width: 80, height: 100, channels: 3, background: "#f5e2b8" },
  })
    .jpeg()
    .toBuffer();
  const form = new FormData();
  form.append("pages", new Blob([image], { type: "image/jpeg" }), "cover.jpg");
  form.append("pages", new Blob([image], { type: "image/jpeg" }), "page-1.jpg");

  const createdResponse = await fetch(`http://127.0.0.1:${address.port}/api/books`, {
    method: "POST",
    body: form,
  });
  assert.equal(createdResponse.status, 202);
  const created = await createdResponse.json();
  assert.equal(created.book.pageCount, 2);

  const completed = await waitFor(async () => {
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/books/${created.book.id}`,
    );
    const body = await response.json();
    return body.book.status === "complete" ? body.book : null;
  });

  assert.equal(completed.title, "테스트 책");
  assert.equal(completed.publisher, "모리출판");
  assert.equal(completed.pages.length, 2);
  assert.equal(completed.pages[1].extractedText, "테스트 본문");
  assert.match(completed.fullText, /테스트 본문/);

  const persisted = database.getBook(completed.id);
  assert.equal(persisted.publisher, "모리출판");
  assert.equal(persisted.pages[0].storedFilename, `${completed.id}/page-001.jpg`);
  await access(join(uploadsDirectory, persisted.pages[0].storedFilename));
});
