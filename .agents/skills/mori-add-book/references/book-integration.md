# Mori book integration contract

Use this reference while editing the application. The project guide
`docs/quiz-generation-guide.md` remains authoritative for question wording and
literacy rationale.

## Files that normally change

| Concern | Location |
|---|---|
| Book metadata, 8 memory-aid sentences, asset references | `src/main.jsx` |
| Source anchors and Lv1/Lv2 questions | `src/quizCurriculum.js` |
| Curriculum counts and behavior | `src/quizCurriculum.test.js` |
| Forbidden source-character names and cast rules | `src/copyrightGuard.test.js` |
| Cover and 8-panel art | `public/assets/<book-id>-cover-vN.png`, `public/assets/<book-id>-story-comic-vN.webp` |
| Offline cache | `public/sw.js` |
| Tablet catalog and end-to-end checks | `scripts/verify-touch.mjs` |
| Reproducible art prompt | `docs/new-book-art-prompts.md` or a sibling art-prompt document |

Do not commit book scans. The existing `.gitignore` excludes local scan folders.

## Book record

Add one `DEFAULT_BOOKS` entry with a stable lowercase ASCII `id` and these
fields:

- `genre`, `title`, `tag`, `color`, `light`, `age`, `minutes`
- `desc`, `mission`, `publisher`, `series`, optional credits, and `topics`
- `cast` (including `cast: {}` for a hero-only story), or a justified
  `castExempt: true`
- `cover`, `storyComic`, exactly eight concise `storySentences`
- incremented `quizVersion`
- `questions: CURRICULUM_QUESTIONS.<book-id>.lv2`

Use `{hero}` and Korean particle forms such as `{hero:가}`, `{hero:는}`,
`{hero:를}`, and `{hero:와}`. Use a generic `guide` role only when needed.
The eight sentences are recall cues after reading, not a replacement for the book.

## Evidence and curriculum

Create a unique source-anchor prefix for the book and record eight concise
derived evidence anchors. Do not store transcription or long passages.

Each question needs:

- a stable ID, source anchors, derived source evidence and source relation;
- `sourceStatus: "adapted-story-awaiting-page-verification"` until page-level
  evidence has actually been checked;
- a clear `why` explanation;
- an interaction supported by the existing renderer.

The shipped structure is:

- **Lv1 (about ages 4–5):** six independently solvable objective questions, no
  speaking task and no question image. Any ordinary choice/completion task has
  four plausible options. A sequence task has four scenes.
- **Lv2 (about ages 6–7):** story read-aloud recording first, then five objective
  questions followed by two speaking/recording tasks. Include comprehension
  operations such as completion, matching, directly verifiable detail, four-scene
  sequencing and main idea. End with retelling/application or inquiry.
- **No Lv3.**

Distractors should be grammatically parallel, similar in specificity and plausible
within the same scene. Avoid joke answers, category mismatches, repeated wording,
and making the correct answer conspicuously longer.

Update count assertions from the actual number of registered books. Add focused
tests for the new book instead of weakening existing invariants.

## Art contract

Generate raster art with the `imagegen` skill when it is available. Inspect two
or three existing covers/comics for texture and production finish, but use an
original app-only character and composition.

- Cover: portrait 3:4, final PNG `1086×1448`, quiet upper third for the app title.
- Story aid: landscape 16:9, final WebP `1600×900`, exactly eight equal panels in
  a strict 4×2 grid with straight white gutters.
- No embedded text, numbers, speech bubbles, logos, watermark or publisher marks.
- Avoid a faithful scene-by-scene substitute for the book.
- Treat embarrassment, fear, health and safety without ridicule or frightening
  imagery. Show adult help where investigation or danger is involved.

Save final project assets in `public/assets`; do not leave them only in the image
tool's generated-output directory. Do not leave `artStatus: "preparing"` after
real art is present. Bump the service-worker cache name so deployed tablets fetch
replaced assets.

## Completion checks

Run:

```powershell
node .agents/skills/mori-add-book/scripts/audit-book-integration.mjs <book-id>
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 5174
$env:TOUCH_TEST_URL='http://127.0.0.1:5174/mori-reading-pad/'; npm run verify:touch
```

The touch check must still cover ordinary taps, one-finger scrolling, file picker
access, adult editing, and selection/zoom guards. Deployment or pushing to GitHub
requires explicit user authorization beyond the book-addition request.
