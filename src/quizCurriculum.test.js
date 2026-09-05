import assert from "node:assert/strict";
import test from "node:test";

import {
  CURRICULUM_QUESTIONS,
  QUIZ_LEVELS,
  SOURCE_ANCHORS,
  levelDetail,
} from "./quizCurriculum.js";

const expectedCounts = {
  money: { lv1: 6, lv2: 7 },
  origin: { lv1: 6, lv2: 7 },
  cold: { lv1: 6, lv2: 7 },
  bicycle: { lv1: 6, lv2: 7 },
  transport: { lv1: 6, lv2: 7 },
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

test("curriculum defines the intended age bands and 65 question records", () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.values(QUIZ_LEVELS).map((level) => [level.id, level.age]),
    ),
    { lv1: "4–5세", lv2: "6–7세" },
  );

  let total = 0;
  for (const [bookId, levelCounts] of Object.entries(expectedCounts)) {
    for (const [level, count] of Object.entries(levelCounts)) {
      assert.equal(CURRICULUM_QUESTIONS[bookId][level].length, count);
      total += count;
    }
  }
  assert.equal(total, 65);
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
});

test("only Lv1 and Lv2 exist (Lv3 removed per the generation guide)", () => {
  assert.deepEqual(Object.keys(QUIZ_LEVELS), ["lv1", "lv2"]);
  for (const levels of Object.values(CURRICULUM_QUESTIONS)) {
    assert.deepEqual(Object.keys(levels), ["lv1", "lv2"]);
  }
});

test("Lv2 ends with exactly two speaking questions", () => {
  const speaking = new Set(["recall", "open-ended", "distancing"]);
  for (const [bookId, levels] of Object.entries(CURRICULUM_QUESTIONS)) {
    const kinds = levels.lv2.map((question) => speaking.has(question.kind));
    const total = kinds.filter(Boolean).length;
    assert.equal(total, 2, `${bookId}: expected 2 speaking questions`);
    // and they must be the last two, so the child answers aloud at the end
    assert.deepEqual(kinds.slice(-2), [true, true], bookId);
    assert.equal(kinds.slice(0, -2).some(Boolean), false, bookId);
  }
});

test("the level card describes the questions that actually ship", () => {
  const speaking = new Set(["recall", "open-ended", "distancing"]);
  for (const level of ["lv1", "lv2"]) {
    const questions = CURRICULUM_QUESTIONS.money[level];
    const spoken = questions.filter((q) => speaking.has(q.kind)).length;
    const detail = levelDetail(level);
    assert.match(detail, new RegExp(String(questions.length - spoken)));
    if (level === "lv2") assert.match(detail, new RegExp(`말하기·녹음 ${spoken}`));
    // Lv1 is objective only, so it must not advertise speaking at all.
    if (level === "lv1") assert.equal(/말하기/.test(detail), false);
  }
});
