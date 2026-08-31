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
  // The transcribed text is never persisted or returned — only an aggregate
  // character count survives so the UI can show how much was analyzed.
  assert.equal(completed.fullText, undefined);
  assert.equal(completed.pages[1].extractedText, undefined);
  assert.equal(completed.textLength, "[업로드 1]\n테스트 본문".length);

  const persisted = database.getBook(completed.id);
  assert.equal(persisted.publisher, "모리출판");

  // Only the cover image (first upload) is kept on disk; every other page image
  // is deleted and its DB reference cleared.
  assert.equal(persisted.pages[0].storedFilename, `${completed.id}/page-001.jpg`);
  assert.equal(persisted.pages[1].storedFilename, null);
  await access(join(uploadsDirectory, `${completed.id}/page-001.jpg`));
  await assert.rejects(access(join(uploadsDirectory, `${completed.id}/page-002.jpg`)));
});

test("reads require the bearer token when one is configured", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "mori-book-auth-"));
  const incomingDirectory = join(root, "incoming");
  const uploadsDirectory = join(root, "uploads");
  await mkdir(incomingDirectory, { recursive: true });
  await mkdir(uploadsDirectory, { recursive: true });

  const database = createDatabase(join(root, "test.sqlite"));
  const analyzer = { configured: false, provider: "test", model: "fixture", async analyze() {} };
  const { app } = createApp({
    database,
    analyzer,
    incomingDirectory,
    uploadsDirectory,
    apiToken: "secret-token",
  });
  const server = app.listen(0);

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    database.close();
    await rm(root, { recursive: true, force: true });
  });

  const { port } = server.address();

  const unauthorized = await fetch(`http://127.0.0.1:${port}/api/books`);
  assert.equal(unauthorized.status, 401);

  const authorized = await fetch(`http://127.0.0.1:${port}/api/books`, {
    headers: { authorization: "Bearer secret-token" },
  });
  assert.equal(authorized.status, 200);

  // Health stays open so uptime checks work without the token.
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
});

test("child photo generation returns eight variants without retaining the upload", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "mori-character-api-"));
  const incomingDirectory = join(root, "incoming");
  const uploadsDirectory = join(root, "uploads");
  await mkdir(incomingDirectory, { recursive: true });
  await mkdir(uploadsDirectory, { recursive: true });

  const database = createDatabase(join(root, "test.sqlite"));
  const analyzer = {
    configured: false,
    provider: "test",
    model: "fixture",
    async analyze() {},
  };
  let receivedPhotoPath = null;
  let receivedUserId = null;
  const characterGenerator = {
    configured: true,
    provider: "test",
    model: "fixture-image",
    async generate(photo, { userId }) {
      receivedPhotoPath = photo.path;
      receivedUserId = userId;
      await access(photo.path);
      return Array.from({ length: 8 }, (_, index) => ({
        id: `variant-${index + 1}`,
        label: `캐릭터 ${index + 1}`,
        description: `옷 ${index + 1}`,
        mimeType: "image/webp",
        base64: Buffer.from(`image-${index + 1}`).toString("base64"),
      }));
    },
  };
  const { app } = createApp({
    database,
    analyzer,
    characterGenerator,
    incomingDirectory,
    uploadsDirectory,
  });
  const server = app.listen(0);

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    database.close();
    await rm(root, { recursive: true, force: true });
  });

  const image = await sharp({
    create: { width: 80, height: 80, channels: 3, background: "#e5c2a5" },
  })
    .png()
    .toBuffer();
  const form = new FormData();
  form.append("photo", new Blob([image], { type: "image/png" }), "child.png");

  const { port } = server.address();
  const response = await fetch(
    `http://127.0.0.1:${port}/api/characters/generate`,
    {
      method: "POST",
      headers: { "X-Mori-User-Id": "local-child-123" },
      body: form,
    },
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.variants.length, 8);
  assert.equal(receivedUserId, "local-child-123");
  await assert.rejects(access(receivedPhotoPath));
});
