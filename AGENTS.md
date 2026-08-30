# Project working agreements

## Child-focused tablet interaction safety

- Preserve the kid-safe interaction guard in `src/kidSafeInteractions.js`, the locked viewport in `index.html`, and the matching CSS in `src/styles.css`.
- Child-facing iPad and tablet screens must prevent accidental pinch and double-tap zoom, text selection, long-press callouts, image dragging, context menus, and clipboard actions while keeping single-finger scrolling and normal taps working.
- Native selection and clipboard behavior may be restored only for an explicit adult or guardian editing area marked with `data-allow-native-editing="true"`.
- When changing navigation or controls, verify the behavior with touch emulation and confirm that ordinary taps, vertical scrolling, file pickers, and guardian text editing still work.
- Keep primary touch targets at least 44 by 44 CSS pixels wherever the layout allows.
