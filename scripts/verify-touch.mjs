import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { chromium } from "playwright-core";
import sharp from "sharp";

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

const target = process.env.TOUCH_TEST_URL || "http://localhost:5173/mori-reading-pad/";
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 820, height: 720 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  });
  await context.grantPermissions(["microphone"], {
    origin: new URL(target).origin,
  });
  const page = await context.newPage();
  const touchCdp = await context.newCDPSession(page);
  const generatedCharacterPng =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const generatedCharacterSheet = await sharp({
    create: {
      width: 800,
      height: 400,
      channels: 4,
      background: "#f7d978",
    },
  })
    .png()
    .toBuffer();
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

  const dragTouch = async (from, to, label) => {
    await from.scrollIntoViewIfNeeded();
    await to.scrollIntoViewIfNeeded();
    const fromBox = await from.boundingBox();
    const toBox = await to.boundingBox();
    assert.ok(fromBox && toBox, `${label} must have two touchable endpoints`);
    const start = {
      x: fromBox.x + fromBox.width - 8,
      y: fromBox.y + fromBox.height / 2,
    };
    const end = {
      x: toBox.x + toBox.width / 2,
      y: toBox.y + toBox.height / 2,
    };
    const touchPoint = (point) => ({
      ...point,
      radiusX: 8,
      radiusY: 8,
      force: 1,
    });
    await touchCdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [touchPoint(start)],
    });
    for (let step = 1; step <= 6; step += 1) {
      const point = {
        x: start.x + ((end.x - start.x) * step) / 6,
        y: start.y + ((end.y - start.y) * step) / 6,
      };
      await touchCdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [touchPoint(point)],
      });
    }
    await touchCdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.waitForTimeout(400);
  };

  await tapCenter(
    page.getByRole("navigation").getByRole("button", { name: "내 캐릭터" }),
    "Profile navigation control",
  );
  await page
    .getByRole("heading", { name: "나만의 책 친구를 만들어 봐요" })
    .waitFor();
  const childNameInput = page.getByRole("textbox", { name: "아이 이름" });
  const adultEditingEvents = await childNameInput.evaluate((input) => {
    const selectEvent = new Event("selectstart", {
      bubbles: true,
      cancelable: true,
    });
    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true });
    input.dispatchEvent(selectEvent);
    input.dispatchEvent(pasteEvent);
    return {
      selectPrevented: selectEvent.defaultPrevented,
      pastePrevented: pasteEvent.defaultPrevented,
    };
  });
  assert.deepEqual(
    adultEditingEvents,
    { selectPrevented: false, pastePrevented: false },
    "Guardian profile editing must preserve native selection and clipboard behavior",
  );
  await page.locator(".character-photo-button input[type=file]").setInputFiles({
    name: "child.png",
    mimeType: "image/png",
    buffer: Buffer.from(generatedCharacterPng, "base64"),
  });
  await page.locator(".character-photo-preview.has-photo").waitFor();
  const characterSheetInput = page.locator(
    ".character-sheet-button input[type=file]",
  );
  assert.equal(
    await characterSheetInput.isEnabled(),
    true,
    "A saved child photo must enable sheet import before the name is entered",
  );
  await characterSheetInput.setInputFiles({
    name: "character-sheet.png",
    mimeType: "image/png",
    buffer: generatedCharacterSheet,
  });
  await page.locator(".character-variant-grid").waitFor();
  assert.equal(
    await page.locator(".character-variant-grid button").count(),
    8,
    "The character maker must offer eight variations",
  );
  await childNameInput.fill("지온");
  await tapCenter(
    page.locator(".character-variant-grid button").first(),
    "First character variation",
  );
  await tapCenter(
    page.getByRole("button", { name: /햇살 독서가로 등록하기/ }),
    "Register selected child character",
  );
  await page.getByText("지온이의 책장", { exact: true }).first().waitFor();
  await page.getByAltText("책을 읽는 지온 캐릭터").waitFor();
  assert.equal(
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem("mori-session-v1"));
      const profile = JSON.parse(
        localStorage.getItem(`mori-user:${session.id}:child-profile`),
      );
      return profile.name;
    }),
    "지온",
  );
  await tapCenter(
    page.getByRole("navigation").getByRole("button", { name: "내 캐릭터" }),
    "Profile navigation after character registration",
  );
  await page.getByRole("heading", { name: "읽기 모험 난이도" }).waitFor();
  const levelOne = page.locator(".level-options").getByRole("radio", { name: /Lv\.1/ });
  const levelTwo = page.locator(".level-options").getByRole("radio", { name: /Lv\.2/ });
  assert.equal(await levelOne.getAttribute("aria-checked"), "true");
  assert.equal(await page.locator(".level-options").getByRole("radio").count(), 2);
  await tapCenter(levelTwo, "Level two selection card");
  assert.equal(await levelTwo.getAttribute("aria-checked"), "true");
  assert.equal(
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem("mori-session-v1"));
      return localStorage.getItem(`mori-user:${session.id}:quiz-level`);
    }),
    "lv2",
  );
  await tapCenter(
    page.getByRole("button", { name: "오늘" }),
    "Home navigation control",
  );

  await tapCenter(
    page.getByRole("button", { name: /모험 시작하기/ }),
    "Quiz start control",
  );
  await page.getByRole("heading", { name: /그림을 보며/ }).waitFor();
  assert.equal(
    await page.locator(".story-sentences button").count(),
    8,
    "The story introduction must match eight sentences to the eight comic panels",
  );
  await tapCenter(
    page.getByRole("button", { name: /줄거리를 읽었어요/ }),
    "Story introduction continue control",
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
  await tapCenter(
    page.getByRole("button", { name: /줄거리 소리 내어 읽기/ }),
    "Open recording activity control",
  );
  await page.getByRole("heading", { name: /줄거리를 천천히/ }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: "녹음 시작하기" }),
    "Start recording control",
  );
  await page.getByText("목소리를 듣고 있어요…", { exact: true }).waitFor();
  await page.waitForTimeout(800);
  await tapCenter(
    page.getByRole("button", { name: "녹음 멈추기" }),
    "Stop recording control",
  );
  await page.locator(".recorder-panel audio").waitFor();
  await tapCenter(
    page.getByRole("button", { name: /녹음 저장하고 책장에 꽂기/ }),
    "Save recording control",
  );
  await page.getByRole("heading", { name: "나의 이야기 도감" }).waitFor();
  assert.equal(await page.getByRole("combobox").count(), 2);
  await page.getByText(/읽은 날/).waitFor();
  await tapCenter(
    page.locator(".catalog-book").first(),
    "Story catalog book control",
  );
  await page.getByRole("heading", { name: "돈이 뭐야?" }).waitFor();
  assert.equal(await page.locator(".archive-page .story-sentences button").count(), 8);
  await page.getByText("저장된 목소리가 있어요", { exact: true }).waitFor();
  await page.locator(".saved-voice audio").waitFor();
  await tapCenter(
    page.getByRole("button", { name: /도감으로/ }),
    "Return to catalog control",
  );
  await tapCenter(
    page.getByRole("navigation").getByRole("button", { name: "내 캐릭터" }),
    "Profile navigation after catalog",
  );
  await tapCenter(
    page.getByRole("radio", { name: /Lv\.1/ }),
    "Level one selection card",
  );
  await tapCenter(
    page.getByRole("button", { name: "오늘" }),
    "Home navigation after level change",
  );
  await tapCenter(
    page.getByRole("button", { name: /모험 시작하기/ }),
    "Level one quiz start control",
  );
  await tapCenter(
    page.getByRole("button", { name: /줄거리를 읽었어요/ }),
    "Level one story continue control",
  );
  await page.getByText("Lv.1", { exact: true }).waitFor();
  await page.getByText("내용 찾기", { exact: true }).first().waitFor();
  await page.getByRole("heading", { name: /오영이의 방에/ }).waitFor();
  const quizWrappingRules = await page.evaluate(() => {
    const selectors = [".quiz-body h1", ".options button"];
    return selectors.map((selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        selector,
        wordBreak: style.wordBreak,
        overflowWrap: style.overflowWrap,
      };
    });
  });
  assert.ok(
    quizWrappingRules.every(
      ({ wordBreak, overflowWrap }) =>
        wordBreak === "keep-all" && overflowWrap === "break-word",
    ),
    `Child-facing text must wrap by word: ${JSON.stringify(quizWrappingRules)}`,
  );

  await tapCenter(
    page.getByRole("button", { name: /노래하는 라디오/ }),
    "Level one first wrong answer",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Level one first attempt submit control",
  );
  await page
    .getByRole("heading", { name: "다시 한번 생각해 볼까?" })
    .waitFor();
  await page
    .getByRole("heading", {
      name: "오영이의 방에 불쑥 들어온 친구는 누구였나요?",
    })
    .waitFor();
  await page.getByText("노래하는 라디오", { exact: true }).waitFor();
  await page
    .getByText(
      "노래하는 라디오는 이야기 속에 등장하지 않았어요. 방에 들어온 친구의 생김새와 말을 떠올려 봐요.",
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await page.getByText("말하는 저금통 또보", { exact: true }).count(),
    0,
    "The first retry screen must not reveal the correct answer",
  );
  await tapCenter(
    page.getByRole("button", { name: /다시 골라보기/ }),
    "Level one retry control",
  );
  assert.equal(
    await page.getByRole("button", { name: /노래하는 라디오/ }).count(),
    0,
    "The selected wrong option must be removed on the second attempt",
  );
  assert.equal(
    await page.locator(".options button").count(),
    3,
    "Exactly one wrong option must be removed",
  );
  await tapCenter(
    page.getByRole("button", { name: /커다란 공룡/ }),
    "Level one second wrong answer",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Level one second attempt submit control",
  );
  await page
    .getByRole("heading", { name: "정답을 알려 줄게요." })
    .waitFor();
  await page
    .locator(".final-answer-callout")
    .getByText("말하는 저금통 또보", { exact: true })
    .waitFor();
  await page
    .getByText(
      "이야기의 시작에서 저금통 또보가 오영이 방에 찾아왔어요.",
      { exact: true },
    )
    .waitFor();
  await page.getByRole("button", { name: /다음 문제/ }).waitFor();

  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next control after level one answer feedback",
  );
  await tapCenter(
    page.getByRole("button", { name: /동전은 둥글고 단단하며/ }),
    "Level one second question answer",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Level one second question submit",
  );
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next control before vocabulary question",
  );
  await tapCenter(
    page.getByRole("button", { name: /물건을 살 때 필요한 돈/ }),
    "Level one vocabulary answer",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Level one vocabulary submit",
  );
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next control before touch matching",
  );
  await page
    .getByRole("heading", { name: /이야기 속 행동과 돈의 쓰임/ })
    .waitFor();
  const matchBoard = page.locator(".match-board");
  await matchBoard.scrollIntoViewIfNeeded();
  await dragTouch(
    page.getByRole("button", { name: /사탕을 산다/ }),
    page.getByRole("button", { name: "서비스를 이용해요" }),
    "Candy to incorrect service touch connection",
  );
  await dragTouch(
    page.getByRole("button", { name: /놀이기구를 탄다/ }),
    page.getByRole("button", { name: "물건을 사요" }),
    "Ride to incorrect goods touch connection",
  );
  await dragTouch(
    page.getByRole("button", { name: /집안일을 돕고 용돈을 받는다/ }),
    page.getByRole("button", { name: "일을 하고 돈을 벌어요" }),
    "Chores to earning touch connection",
  );
  assert.equal(
    await page.locator(".match-line.complete").count(),
    3,
    "Three visible lines must connect the completed matching answer",
  );
  assert.equal(
    await page.getByRole("button", { name: "정답 확인하기" }).isEnabled(),
    true,
    "Completing all touch-drawn lines must enable answer submission",
  );
  await page.getByRole("button", { name: "정답 확인하기" }).click();
  await page.locator(".feedback h1").waitFor();
  assert.equal(
    await page.locator(".feedback h1").textContent(),
    "다시 한번 생각해 볼까?",
    "An incorrect touch match must open the level one retry feedback",
  );
  await page
    .getByText("사탕을 산다 → 서비스를 이용해요", { exact: true })
    .waitFor();
  await page
    .getByText(
      "사탕은 손에 들고 먹을 수 있는 물건이에요. 그래서 “물건을 사요”와 이어져요.",
      { exact: true },
    )
    .waitFor();
  await tapCenter(
    page.getByRole("button", { name: /다시 골라보기/ }),
    "Touch matching retry control",
  );
  await page.waitForFunction(
    () => document.querySelectorAll(".match-line.complete").length === 0,
  );

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
