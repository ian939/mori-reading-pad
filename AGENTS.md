# Project working agreements

## 저작권 (copyright) — book content

The sample books are **real published works** (그레이트북스 「내 친구 사회공룡」 등).
We use their *concepts* (money, hygiene, food origins…) — those are unprotectable
ideas — but must not reproduce their protected *expression*: proprietary named
characters or a faithful retelling of the specific plot.

Rules when adding or editing any book (`DEFAULT_BOOKS` in `src/main.jsx` and its
questions in `src/quizCurriculum.js`):

- **Never ship the book's proprietary character names.** Replace the protagonist
  with the neutral story cast token `{hero}` (filled from the child's character,
  default `모리`) and helper/other characters with generic role nouns
  (e.g. `저금통 친구`, `빵집 아저씨`, `엄마`). Particle tokens like `{hero:이}` /
  `{hero:는}` / `{hero:를}` / `{hero:와}` auto-conjugate to the name.
- **Declare `cast` on the book** (even `cast: {}` for hero-only) so `hydrateCast`
  substitutes the tokens. A book with genuinely no proprietary characters (only
  generic framing, e.g. `origin`'s "우주 친구들") may set `castExempt: true` with a
  comment instead.
- **Never store or ship a book's full text.** The registration pipeline uses the
  transcription only in memory and persists derived data only (see `server/`).
- **Keep the story a memory aid, not a substitute** — summaries should point at
  the book, not replace reading it.
- `npm test` enforces this: `src/copyrightGuard.test.js` fails if a forbidden
  character name ships or a book lacks `cast`/`castExempt`. Add new books'
  characters to its `FORBIDDEN_NAMES` list.

## Child-focused tablet interaction safety

- Preserve the kid-safe interaction guard in `src/kidSafeInteractions.js`, the locked viewport in `index.html`, and the matching CSS in `src/styles.css`.
- Child-facing iPad and tablet screens must prevent accidental pinch and double-tap zoom, text selection, long-press callouts, image dragging, context menus, and clipboard actions while keeping single-finger scrolling and normal taps working.
- Native selection and clipboard behavior may be restored only for an explicit adult or guardian editing area marked with `data-allow-native-editing="true"`.
- When changing navigation or controls, verify the behavior with touch emulation and confirm that ordinary taps, vertical scrolling, file pickers, and guardian text editing still work.
- Keep primary touch targets at least 44 by 44 CSS pixels wherever the layout allows.

## Adding books

- When the user asks to add a book to this product, use the project skill at
  `.agents/skills/mori-add-book/SKILL.md` so metadata, evidence, Lv1/Lv2
  curriculum, story memory aids, original art, offline caching, and tablet
  verification are completed together.
