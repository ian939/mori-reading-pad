---
name: mori-add-book
description: Add a new book to the Mori Reading Pad repository when the user asks to add, register, or prepare a book for the app. Covers source-grounded metadata, an eight-cue reading aid, Lv1/Lv2 quizzes, original cover and eight-panel art, offline caching, tests, and tablet validation. Do not use for a guardian merely uploading scans through the running app or for reviewing one existing question.
---

# Mori Add Book

Deliver a complete, usable book entry. Do not stop after adding metadata or leave
art as a placeholder when image generation is available.

## Start

1. Read the repository `AGENTS.md` and `docs/quiz-generation-guide.md`.
2. Read [references/book-integration.md](references/book-integration.md) before
   editing; it defines the current file map, curriculum contract and validation.
3. Inspect the source material supplied by the user or stored in an ignored local
   scan directory. If the source is absent or unreadable, do not invent book facts:
   search for a reliable source when authorized/required, or ask for the missing
   pages.
4. Inspect the working tree and preserve unrelated or concurrent user changes.

## Build the entry

- Separate verified source facts from educational adaptation. Keep only short,
  derived evidence anchors; never store or commit a transcription or full book text.
- Replace proprietary named characters with `{hero}`, a generic role, or an
  explicitly justified cast exemption. Add source character names to the copyright
  guard.
- Add the book record, exactly eight concise memory-aid sentences, source anchors,
  six Lv1 objective tasks and seven Lv2 tasks using the repository contract.
- Review every distractor as natural Korean for the target age. Correct options
  must not stand out by length, detail, grammar or absurd alternatives.
- Keep Lv1 image-free and speaking-free. Preserve the Lv1-to-Lv2 invitation and
  the Lv2 read-aloud recording start.

## Create the art

Use the `imagegen` skill for raster generation and explicitly say why it is being
used. Reuse the repository's established crayon/colored-pencil finish and asset
dimensions, but create original app-only characters and compositions. Inspect the
cover and eight-panel output, iterate on panel count/character consistency when
needed, then save final files under `public/assets`.

Update the art prompt document with the final reproducible prompt set. Replace any
placeholder status and bump the service-worker cache so deployed tablets receive
the new files.

## Verify and hand off

Run the audit script for every new ID, then the unit tests, production build and
touch-emulated end-to-end check described in the reference. Confirm covers and
story art decode at their expected dimensions and no “그림 준비 중” badge remains.

Report source confidence, added IDs, asset paths, final prompt document, validation
results and any unresolved page-level verification. Adding a book does not itself
authorize a GitHub push, deployment, scan deletion, or other external mutation;
perform those only when the user explicitly asks.
