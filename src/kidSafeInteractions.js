const NATIVE_EDITING_ZONE = "[data-allow-native-editing='true']";
const EDITABLE_CONTROL = "input, textarea, select, [contenteditable='true']";
const BLOCKED_NATIVE_EVENTS = [
  "contextmenu",
  "dragstart",
  "selectstart",
  "copy",
  "cut",
  "paste",
];
const ZOOM_KEYS = new Set(["+", "-", "=", "0"]);

function allowsNativeEditing(target) {
  if (!(target instanceof Element)) return false;
  const control = target.closest(EDITABLE_CONTROL);
  return Boolean(control?.closest(NATIVE_EDITING_ZONE));
}

function isTouchExperience(view) {
  return (
    view.navigator.maxTouchPoints > 0 ||
    view.matchMedia?.("(hover: none) and (pointer: coarse)").matches
  );
}

export function enableKidSafeInteractions({
  doc = document,
  force = false,
} = {}) {
  const view = doc.defaultView;
  if (!view || (!force && !isTouchExperience(view))) return () => {};

  doc.documentElement.classList.add("kid-safe-interactions");

  let previousTap = { time: 0, x: 0, y: 0 };

  const preventOutsideAdultEditor = (event) => {
    if (!allowsNativeEditing(event.target)) event.preventDefault();
  };

  const preventMultiTouchZoom = (event) => {
    if (event.touches?.length > 1 && !allowsNativeEditing(event.target)) {
      event.preventDefault();
    }
  };

  const preventDoubleTapZoom = (event) => {
    if (allowsNativeEditing(event.target)) return;

    const touch = event.changedTouches?.[0];
    const currentTap = {
      time: Date.now(),
      x: touch?.clientX ?? 0,
      y: touch?.clientY ?? 0,
    };
    const isQuick = currentTap.time - previousTap.time < 350;
    const isNearby =
      Math.abs(currentTap.x - previousTap.x) < 24 &&
      Math.abs(currentTap.y - previousTap.y) < 24;

    if (previousTap.time && isQuick && isNearby) event.preventDefault();
    previousTap = currentTap;
  };

  const preventTrackpadZoom = (event) => {
    if (event.ctrlKey && !allowsNativeEditing(event.target)) {
      event.preventDefault();
    }
  };

  const preventKeyboardZoom = (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      ZOOM_KEYS.has(event.key) &&
      !allowsNativeEditing(event.target)
    ) {
      event.preventDefault();
    }
  };

  BLOCKED_NATIVE_EVENTS.forEach((type) =>
    doc.addEventListener(type, preventOutsideAdultEditor),
  );
  ["gesturestart", "gesturechange", "gestureend"].forEach((type) =>
    doc.addEventListener(type, preventOutsideAdultEditor, { passive: false }),
  );
  doc.addEventListener("touchmove", preventMultiTouchZoom, { passive: false });
  doc.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
  doc.addEventListener("wheel", preventTrackpadZoom, { passive: false });
  doc.addEventListener("keydown", preventKeyboardZoom);

  return () => {
    doc.documentElement.classList.remove("kid-safe-interactions");
    BLOCKED_NATIVE_EVENTS.forEach((type) =>
      doc.removeEventListener(type, preventOutsideAdultEditor),
    );
    ["gesturestart", "gesturechange", "gestureend"].forEach((type) =>
      doc.removeEventListener(type, preventOutsideAdultEditor),
    );
    doc.removeEventListener("touchmove", preventMultiTouchZoom);
    doc.removeEventListener("touchend", preventDoubleTapZoom);
    doc.removeEventListener("wheel", preventTrackpadZoom);
    doc.removeEventListener("keydown", preventKeyboardZoom);
  };
}
