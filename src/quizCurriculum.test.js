import assert from "node:assert/strict";
import test from "node:test";

import {
  CURRICULUM_QUESTIONS,
  QUIZ_LEVELS,
  SOURCE_ANCHORS,
} from "./quizCurriculum.js";

const expectedCounts = {
  money: { lv1: 6, lv2: 8, lv3: 8 },
  origin: { lv1: 6, lv2: 8, lv3: 8 },
  cold: { lv1: 6, lv2: 8, lv3: 8 },
  bicycle: { lv1: 6, lv2: 8, lv3: 8 },
  transport: { lv1: 6, lv2: 8, lv3: 8 },
};
const supportedKinds = new Set([
  "choice",
  "image-choice",
  "completion",
  "sequence",
  "match",
  "recall",
  "open-ended",
  "distancing",
]);

test("curriculum defines the intended age bands and 110 question records", () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.values(QUIZ_LEVELS).map((level) => [level.id, level.age]),
    ),
    { lv1: "4–5세", lv2: "6–7세", lv3: "8–9세" },
  );

  let total = 0;
  for (const [bookId, levelCounts] of Object.entries(expectedCounts)) {
    for (const [level, count] of Object.entries(levelCounts)) {
      assert.equal(CURRICULUM_QUESTIONS[bookId][level].length, count);
      total += count;
    }
  }
  assert.equal(total, 110);
});

test("every question has traceable evidence and a supported interaction", () => {
  const ids = new Set();
  for (const [bookId, levels] of Object.entries(CURRICULUM_QUESTIONS)) {
    for (const questions of Object.values(levels)) {
      for (const question of questions) {
        assert.ok(question.id && !ids.has(question.id));
        ids.add(question.id);
        assert.ok(supportedKinds.has(question.kind), question.id);
        assert.ok(question.sourceEvidence?.length > 0, question.id);
        assert.equal(
          question.sourceStatus,
          "adapted-story-awaiting-page-verification",
        );
        assert.ok(["direct", "inference", "extension"].includes(question.sourceRelation));
        assert.ok(["objective", "performance"].includes(question.scoreMode));
        assert.ok(question.sourceAnchors.length > 0, question.id);
        if (question.kind === "image-choice") {
          assert.match(question.visual, /^assets\/.+\.(png|webp)$/);
          assert.ok(question.visualAlt?.length > 0, question.id);
        }
        question.sourceAnchors.forEach((anchor) =>
          assert.ok(SOURCE_ANCHORS[bookId][anchor], `${question.id}: ${anchor}`),
        );
      }
    }
  }
});

test("unverified tomato-to-ketchup and cold-chain explanations are not asserted", () => {
  const serialized = JSON.stringify(CURRICULUM_QUESTIONS);
  assert.equal(serialized.includes("케첩"), false);
  assert.equal(serialized.includes("상하지 않"), false);

  const coldChainQuestion = CURRICULUM_QUESTIONS.origin.lv3.find(
    (question) => question.id === "origin-lv3-07",
  );
  assert.equal(coldChainQuestion.sourceRelation, "direct");
  assert.match(coldChainQuestion.q, /추가 자료/);
  assert.match(coldChainQuestion.options[coldChainQuestion.answer], /과학적 이유/);
});
