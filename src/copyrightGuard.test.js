import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { CURRICULUM_QUESTIONS, SOURCE_ANCHORS } from "./quizCurriculum.js";

// Guards the copyright direction (see AGENTS.md "저작권"). Book content is
// built from real published books, so their proprietary characters must be
// replaced by the neutral story cast ({hero}/{guide}) and never ship.
const here = dirname(fileURLToPath(import.meta.url));
const mainSource = readFileSync(join(here, "main.jsx"), "utf8");

// Named characters from the real sample books. If a new real book is added,
// add its characters here too.
const FORBIDDEN_NAMES = [
  "또보",
  "오영이",
  "토비",
  "민수",
  "아기 곰",
  "엄마 곰",
  "고릴라",
  "훈이",
  "재호",
  "태준이",
  "다행 아저씨",
];

test("proprietary book character names never ship in book content", () => {
  const haystacks = {
    "quizCurriculum CURRICULUM_QUESTIONS": JSON.stringify(CURRICULUM_QUESTIONS),
    "quizCurriculum SOURCE_ANCHORS": JSON.stringify(SOURCE_ANCHORS),
    "main.jsx": mainSource,
  };
  const found = [];
  for (const [where, text] of Object.entries(haystacks)) {
    for (const name of FORBIDDEN_NAMES) {
      if (text.includes(name)) found.push(`"${name}" in ${where}`);
    }
  }
  assert.deepEqual(
    found,
    [],
    `Proprietary character names must be replaced by the story cast:\n${found.join("\n")}`,
  );
});

test("every DEFAULT_BOOKS entry declares a cast or an explicit castExempt", () => {
  const start = mainSource.indexOf("const DEFAULT_BOOKS = [");
  assert.ok(start >= 0, "DEFAULT_BOOKS array not found in main.jsx");
  const region = mainSource.slice(start, mainSource.indexOf("\n];", start));

  const books = [...region.matchAll(/^ {4}id: "(\w+)",$/gm)].map((match) => ({
    id: match[1],
    index: match.index,
  }));
  assert.ok(books.length >= 5, `expected >= 5 books, found ${books.length}`);

  const missing = books
    .filter((book, i) => {
      const segment = region.slice(book.index, books[i + 1]?.index ?? region.length);
      const hasCast = /\n {4}cast:/.test(segment);
      const hasExempt = /castExempt:\s*true/.test(segment);
      return !hasCast && !hasExempt;
    })
    .map((book) => book.id);

  assert.deepEqual(
    missing,
    [],
    `Books built from real publications must declare a cast (neutralized characters) ` +
      `or castExempt: true (no proprietary characters). Missing: ${missing.join(", ")}`,
  );
});
