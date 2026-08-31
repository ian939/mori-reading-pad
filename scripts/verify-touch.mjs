import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { chromium } from "playwright-core";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

let executablePath;
for (const candidate of chromeCandidates) {
  try {
    await access(candidate);
    executablePath = candidate;
    break;
  } catch {
    // Try the next local Chrome installation.
  }
}

if (!executablePath) {
  throw new Error("Touch verification requires Chrome. Set CHROME_PATH and retry.");
}

const browser = await chromium.launch({ headless: true, executablePath });
try {
  const context = await browser.newContext({
    viewport: { width: 820, height: 720 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();
  const target = process.env.TOUCH_TEST_URL || "http://localhost:5173/mori-reading-pad/";
  await page.goto(target, { waitUntil: "networkidle" });

  const tapCenter = async (locator, label) => {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    assert.ok(box, `${label} must have a touchable box`);
    assert.ok(
      box.width >= 44 && box.height >= 44,
      `${label} must be at least 44 by 44 CSS pixels`,
    );
    await page.touchscreen.tap(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );
    await page.waitForTimeout(400);
  };

  await tapCenter(
    page.getByRole("button", { name: /모험 시작하기/ }),
    "Quiz start control",
  );
  await page.getByText("Completion", { exact: true }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /가격/ }),
    "Completion word card",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Completion submit control",
  );
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next question control",
  );
  await page.getByText("Recall", { exact: true }).waitFor();
  assert.equal(
    await page.getByText("힌트가 필요해요", { exact: true }).isVisible(),
    true,
    "Recall must offer an optional hint",
  );
  await tapCenter(
    page.getByRole("button", { name: /두 가지 모두 기억했어요/ }),
    "Recall reflection card",
  );
  await tapCenter(
    page.getByRole("button", { name: "내 생각 남기기" }),
    "Reflection submit control",
  );
  await page.getByRole("heading", { name: "내 생각을 잘 꺼냈어요!" }).waitFor();

  const remainingMethods = [
    "Wh-question",
    "Completion",
    "Wh-question",
    "Recall",
    "Open-ended",
    "Open-ended",
    "Distancing",
    "Distancing",
  ];
  for (const [remainingIndex, method] of remainingMethods.entries()) {
    await tapCenter(
      page.getByRole("button", { name: /다음 문제/ }),
      `Next control before ${method}`,
    );
    await page.getByText(method, { exact: true }).waitFor();
    const reflective = ["Recall", "Open-ended", "Distancing"].includes(method);
    await tapCenter(
      reflective
        ? page.locator(".reflection-prompts button").first()
        : page.locator(".options button").first(),
      `${method} response control ${remainingIndex + 3}`,
    );
    await tapCenter(
      page.getByRole("button", {
        name: reflective ? "내 생각 남기기" : "정답 확인하기",
      }),
      `${method} submit control ${remainingIndex + 3}`,
    );
    await page.locator(".feedback h1").waitFor();
  }
  await tapCenter(
    page.getByRole("button", { name: /모험 마치기/ }),
    "Finish adventure control",
  );
  await page.getByText("3 / 4", { exact: true }).waitFor();
  await page.getByText("생각 말하기 6 / 6", { exact: true }).waitFor();

  await page.goto(target, { waitUntil: "networkidle" });

  const bookCapture = page.getByRole("button", { name: "책 찍기" });
  const captureBox = await bookCapture.boundingBox();
  assert.ok(captureBox, "Book capture navigation must have a touchable box");
  await page.touchscreen.tap(
    captureBox.x + captureBox.width / 2,
    captureBox.y + captureBox.height / 2,
  );
  await page.getByRole("heading", { name: /책을 찍으면 글과/ }).waitFor();

  const navTargets = await page.locator(".bottom-nav button").evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );
  assert.ok(
    navTargets.every(({ width, height }) => width >= 44 && height >= 44),
    "Every bottom navigation control must be at least 44 by 44 CSS pixels",
  );

  const eventGuards = await page.evaluate(() => {
    const outside = document.querySelector(".add-page h1");
    const adultInput = document.querySelector(".add-page input[type='file']");
    const dispatch = (target, type) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    };
    return {
      outsideSelectBlocked: dispatch(outside, "selectstart"),
      outsideCopyBlocked: dispatch(outside, "copy"),
      outsideContextBlocked: dispatch(outside, "contextmenu"),
      adultInputSelectionAllowed: !dispatch(adultInput, "selectstart"),
      adultInputPasteAllowed: !dispatch(adultInput, "paste"),
    };
  });
  assert.deepEqual(eventGuards, {
    outsideSelectBlocked: true,
    outsideCopyBlocked: true,
    outsideContextBlocked: true,
    adultInputSelectionAllowed: true,
    adultInputPasteAllowed: true,
  });

  const cdp = await context.newCDPSession(page);
  const scrollChecks = await page.evaluate(() => {
    const surface = document.querySelector(".add-page");
    const event = new Event("touchmove", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "touches", {
      value: [{ identifier: 1, clientX: 400, clientY: 500 }],
    });
    surface.dispatchEvent(event);

    return {
      singleTouchAllowed: !event.defaultPrevented,
      touchAction: getComputedStyle(document.documentElement).touchAction,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });
  assert.equal(
    scrollChecks.singleTouchAllowed,
    true,
    "A single-finger touch move must not be cancelled by the interaction guard",
  );
  assert.match(
    scrollChecks.touchAction,
    /^(auto|manipulation|pan-y|pan-x pan-y|pan-y pan-x)$/,
    "The root touch-action must continue to permit vertical panning",
  );
  assert.ok(
    scrollChecks.scrollHeight > scrollChecks.innerHeight,
    "The registration screen must be vertically scrollable on iPad",
  );
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
  await page.waitForTimeout(50);
  const scrollPosition = await page.evaluate(() => window.scrollY);
  assert.ok(scrollPosition > 0, "The document scroll container must remain unlocked");

  await page.evaluate(() => window.scrollTo(0, 0));
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 330, y: 520, id: 1 },
      { x: 490, y: 520, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: 210, y: 520, id: 1 },
      { x: 610, y: 520, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(150);
  assert.equal(
    await page.evaluate(() => window.visualViewport?.scale || 1),
    1,
    "Pinch zoom must stay locked on child-facing tablet surfaces",
  );

  await page.touchscreen.tap(410, 420);
  await page.touchscreen.tap(410, 420);
  await page.waitForTimeout(150);
  assert.equal(
    await page.evaluate(() => window.visualViewport?.scale || 1),
    1,
    "Double-tap zoom must stay locked",
  );

  const filePicker = page.locator(".add-page input[type='file']").first();
  assert.equal(await filePicker.isEnabled(), true);
  await filePicker.setInputFiles({
    name: "touch-check.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByText("사진 1장", { exact: true }).waitFor();
  console.log("Touch verification passed: tap, scroll, file picker, selection and zoom guards.");
} finally {
  await browser.close();
}
