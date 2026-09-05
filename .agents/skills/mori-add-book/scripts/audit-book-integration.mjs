import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../../../..");
const requestedIds = process.argv.slice(2);

if (requestedIds.length === 0) {
  console.error(
    "Usage: node .agents/skills/mori-add-book/scripts/audit-book-integration.mjs <book-id> [book-id...]",
  );
  process.exit(2);
}

const readProjectFile = (relativePath) =>
  readFile(path.join(projectRoot, relativePath), "utf8");

const [mainSource, curriculumSource, serviceWorkerSource, promptSource, touchSource] =
  await Promise.all([
    readProjectFile("src/main.jsx"),
    readProjectFile("src/quizCurriculum.js"),
    readProjectFile("public/sw.js"),
    readProjectFile("docs/new-book-art-prompts.md"),
    readProjectFile("scripts/verify-touch.mjs"),
  ]);

function extractBalanced(source, openIndex, openCharacter, closeCharacter) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === openCharacter) depth += 1;
    if (character === closeCharacter) {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, index + 1);
    }
  }
  throw new Error(`Unbalanced ${openCharacter}${closeCharacter} block`);
}

function bookBlock(bookId) {
  const marker = `id: "${bookId}"`;
  const markerIndex = mainSource.indexOf(marker);
  assert.ok(markerIndex >= 0, `DEFAULT_BOOKS is missing id "${bookId}"`);
  const blockStart = mainSource.lastIndexOf("  {", markerIndex);
  return extractBalanced(mainSource, blockStart + 2, "{", "}");
}

function arrayAfter(source, marker) {
  const markerIndex = source.indexOf(marker);
  assert.ok(markerIndex >= 0, `Missing ${marker}`);
  const arrayStart = source.indexOf("[", markerIndex);
  return extractBalanced(source, arrayStart, "[", "]");
}

function quotedEntryCount(arraySource) {
  return arraySource
    .split(/\r?\n/)
    .filter((line) => /^\s*["'`]/.test(line)).length;
}

async function assertImage(relativePath, expectedWidth, expectedHeight, bookId) {
  const absolutePath = path.join(projectRoot, "public", relativePath);
  await access(absolutePath);
  const [metadata, fileStat] = await Promise.all([
    sharp(absolutePath).metadata(),
    stat(absolutePath),
  ]);
  assert.equal(metadata.width, expectedWidth, `${bookId}: ${relativePath} width`);
  assert.equal(metadata.height, expectedHeight, `${bookId}: ${relativePath} height`);
  assert.ok(
    fileStat.size > 100_000,
    `${bookId}: ${relativePath} still looks like a placeholder (${fileStat.size} bytes)`,
  );
}

for (const bookId of requestedIds) {
  assert.match(bookId, /^[a-z0-9-]+$/, `Invalid book id: ${bookId}`);
  const block = bookBlock(bookId);
  assert.match(block, /\b(?:cast|castExempt):/, `${bookId}: cast declaration missing`);
  assert.doesNotMatch(
    block,
    /artStatus:\s*["']preparing["']/,
    `${bookId}: real art cannot remain in preparing state`,
  );

  const title = block.match(/\btitle:\s*"([^"]+)"/)?.[1];
  assert.ok(title, `${bookId}: title missing`);
  assert.ok(touchSource.includes(`"${title}"`), `${bookId}: touch catalog missing title`);

  const storySentences = arrayAfter(block, "storySentences:");
  assert.equal(
    quotedEntryCount(storySentences),
    8,
    `${bookId}: storySentences must contain exactly eight one-line entries`,
  );

  const coverPath = block.match(/cover:\s*asset\("([^"]+)"\)/)?.[1];
  const storyPath = block.match(/storyComic:\s*asset\("([^"]+)"\)/)?.[1];
  assert.ok(coverPath, `${bookId}: cover asset missing`);
  assert.ok(storyPath, `${bookId}: story comic asset missing`);
  assert.ok(serviceWorkerSource.includes(coverPath), `${bookId}: cover not cached by sw.js`);
  assert.ok(serviceWorkerSource.includes(storyPath), `${bookId}: story art not cached by sw.js`);
  assert.ok(promptSource.includes("(`" + bookId + "`)"), `${bookId}: art prompt section missing`);

  await assertImage(coverPath, 1086, 1448, bookId);
  await assertImage(storyPath, 1600, 900, bookId);

  const escapedBookId = bookId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(
    curriculumSource,
    new RegExp(`\\n  ${escapedBookId}: \\{`),
    `${bookId}: curriculum block missing`,
  );
  assert.match(curriculumSource, new RegExp(`${escapedBookId}-lv1-0[1-6]`), `${bookId}: Lv1 IDs missing`);
  assert.match(curriculumSource, new RegExp(`${escapedBookId}-lv2-0[1-7]`), `${bookId}: Lv2 IDs missing`);

  console.log(`✓ ${bookId}: metadata, 8 cues, curriculum, real art, prompts and cache verified`);
}
