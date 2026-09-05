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

  const catalogBooks = [
    ["돈이 뭐야?", "돈은 왜 필요하고, 어떻게 모을까요?"],
    ["우리가 어디서 왔게?", "내가 먹는 음식은 어디에서 올까요?"],
    ["막아라! 감기", "감기 바이러스의 이동을 어떻게 막을까요?"],
    ["자전거 사 주세요", "갖고 싶은 것을 위해 어떻게 돈을 모을까요?"],
    ["타고, 타고, 타고!", "먼 길을 갈 때 어떤 교통수단을 어떻게 이용할까요?"],
    ["걱정 아저씨, 어디 가세요?", "걱정을 잔뜩 안고 가면 어떤 일이 생길까요?"],
    ["난 오줌 안 쌌어", "실수했을 때 숨기면 어떤 일이 생길까요?"],
    ["놀이터 귀신", "무서운 것의 정체를 어떻게 확인할까요?"],
  ];
  // Lv.1 uses the story text and objective controls only; it never generates
  // or displays question artwork (docs/quiz-generation-guide.md).
  const preparingArtBooks = new Set([
    "걱정 아저씨, 어디 가세요?",
    "난 오줌 안 쌌어",
    "놀이터 귀신",
  ]);
  const selectShelfBook = async (title) => {
    const tab = page.getByRole("tab", { name: title, exact: true });
    await tab.click();
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if ((await tab.getAttribute("aria-selected")) === "true") break;
      await page.waitForTimeout(50);
    }
    assert.equal(
      await tab.getAttribute("aria-selected"),
      "true",
      `${title} must move to the front of the shelf`,
    );
    const frontCard = page
      .locator(".shelf-slot.front .book-card")
      .filter({ hasText: title });
    await frontCard.waitFor();
    return frontCard;
  };
  assert.equal(
    await page.locator(".shelf-slot").count(),
    catalogBooks.length,
    "The home catalog must expose every registered book",
  );
  for (const [title] of catalogBooks) {
    assert.equal(
      await page.getByRole("tab", { name: title, exact: true }).count(),
      1,
      `${title} must appear once in the catalog`,
    );
    const card = await selectShelfBook(title);
    assert.equal(
      await card.locator(".book-cover > img").evaluate(async (image) => {
        if (!image.complete) await image.decode();
        return image.naturalWidth > 0 && image.naturalHeight > 0;
      }),
      true,
      `${title} cover must load`,
    );
    if (preparingArtBooks.has(title)) {
      assert.equal(
        await card.locator(".book-cover").getAttribute("data-art-status"),
        "preparing",
        `${title} cover must expose its preparation state`,
      );
      await card.getByText("그림 준비 중", { exact: true }).waitFor();
    }
  }

  for (const [title, mission] of catalogBooks.slice(2)) {
    const card = await selectShelfBook(title);
    await card.click();
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
    await page.getByRole("heading", { name: mission, exact: true }).waitFor();
    await page.getByRole("button", { name: /Lv\.1 퀴즈 시작하기/ }).click();
    if (preparingArtBooks.has(title)) {
      await page.getByText("8컷 그림을 준비하고 있어요", { exact: true }).waitFor();
    } else {
      assert.equal(
        await page.locator(".story-art-notice").count(),
        0,
        `${title} must not show a preparation notice`,
      );
    }
    assert.equal(
      await page.locator(".story-sentences li").count(),
      8,
      `${title} story must match eight sentences to eight comic panels`,
    );
    assert.equal(
      await page.locator(".story-comic img").evaluate(async (image) => {
        if (!image.complete) await image.decode();
        return image.naturalWidth > 0 && image.naturalHeight > 0;
      }),
      true,
      `${title} story comic must load`,
    );
    await page.getByRole("button", { name: /줄거리를 읽었어요/ }).click();
    await page.locator(".quiz-body h1").waitFor();
    assert.equal(
      await page.locator(".question-visual").count(),
      0,
      `${title} Lv.1 questions must stay free of generated quiz artwork`,
    );
    await page.goto(target, { waitUntil: "networkidle" });
  }

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

  const swipeTouch = async (locator, { x: deltaX, y: deltaY }, label) => {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    assert.ok(box, `${label} must have a swipeable box`);
    const start = {
      x: box.x + box.width / 2 - deltaX / 2,
      y: box.y + box.height / 2 - deltaY / 2,
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
    for (let step = 1; step <= 8; step += 1) {
      await touchCdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          touchPoint({
            x: start.x + (deltaX * step) / 8,
            y: start.y + (deltaY * step) / 8,
          }),
        ],
      });
    }
    await touchCdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.waitForTimeout(400);
  };

  const homeShelf = page.locator(".shelf-track");
  const homeShelfBefore = await homeShelf.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    scrollLeft: element.scrollLeft,
    touchAction: getComputedStyle(element).touchAction,
    slotWidths: [...element.children].map((child) => child.offsetWidth),
  }));
  assert.ok(
    homeShelfBefore.scrollWidth > homeShelfBefore.clientWidth,
    "The home shelf must have real horizontal overflow",
  );
  assert.match(
    homeShelfBefore.touchAction,
    /^(pan-x pan-y|pan-y pan-x)$/,
    "The home shelf must allow horizontal swipes and vertical page panning",
  );
  assert.equal(
    new Set(homeShelfBefore.slotWidths).size,
    1,
    "Book slots must keep stable widths throughout a native swipe",
  );
  await homeShelf.evaluate((element) => {
    window.__homeShelfMotion = [];
    const sampleMotion = () => {
      requestAnimationFrame(() => {
        window.__homeShelfMotion.push(
          [...element.children].map((child) =>
            Number.parseFloat(
              getComputedStyle(child).getPropertyValue("--shelf-open") || "0",
            ),
          ),
        );
      });
    };
    element.addEventListener("scroll", sampleMotion, {
      passive: true,
      once: false,
    });
  });
  await swipeTouch(homeShelf, { x: -260, y: 0 }, "Landscape home shelf swipe");
  assert.ok(
    (await homeShelf.evaluate((element) => element.scrollLeft)) >
      homeShelfBefore.scrollLeft,
    "A one-finger swipe must move the home shelf in landscape",
  );
  const homeShelfMotion = await page.evaluate(() => window.__homeShelfMotion);
  assert.ok(
    homeShelfMotion.some((sample) =>
      sample.some((open) => open > 0.05 && open < 0.95),
    ),
    "Books must progressively turn from spine to cover during a native swipe",
  );
  await homeShelf.evaluate((element) =>
    element.scrollTo({ left: 0, behavior: "instant" }),
  );

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
  const characterSheetInput = page.locator(
    ".character-sheet-button input[type=file]",
  );
  assert.equal(
    await characterSheetInput.isEnabled(),
    true,
    "The guardian character-sheet picker must be enabled before the name is entered",
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
  const importedCornerAlpha = await page
    .locator(".character-variant-grid img")
    .first()
    .evaluate(async (image) => {
      if (!image.complete) await new Promise((resolve) => image.addEventListener("load", resolve));
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
  assert.equal(
    importedCornerAlpha,
    0,
    "The locally imported character must have a transparent outer background",
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
  assert.equal(
    await page.locator(".level-options").getByRole("radio", { name: /Lv\.3/ }).count(),
    0,
    "Lv.3 must stay removed from the child-facing level picker",
  );
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
    await page.locator(".story-sentences li").count(),
    8,
    "The story introduction must match eight sentences to the eight comic panels",
  );
  await tapCenter(
    page.getByRole("button", { name: /줄거리를 소리 내어 읽어 보자/ }),
    "Lv2 story reading recording control",
  );
  await page.getByText("목소리를 듣고 있어요…", { exact: true }).waitFor();
  await page.waitForTimeout(500);
  await tapCenter(
    page.getByRole("button", { name: /다 읽었어요/ }),
    "Lv2 story reading stop control",
  );
  await tapCenter(
    page.getByRole("button", { name: /이 녹음으로 퀴즈 시작/ }),
    "Lv2 recorded story continue control",
  );
  await page.getByText("빈칸 채우기", { exact: true }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /계획/ }),
    "Completion word card",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Completion submit control",
  );
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next control before level two matching",
  );
  await page.getByText("개념 연결", { exact: true }).waitFor();
  await dragTouch(
    page.getByRole("button", { name: /물건을 사기 전에 가격을 살펴봐요/ }),
    page.getByRole("button", { name: "비교" }),
    "Price to comparison touch connection",
  );
  await dragTouch(
    page.getByRole("button", { name: /일을 해서 돈을 벌어요/ }),
    page.getByRole("button", { name: "벌기" }),
    "Work to earning touch connection",
  );
  await dragTouch(
    page.getByRole("button", { name: /쓰지 않은 동전을 저금통에 넣어요/ }),
    page.getByRole("button", { name: "저축" }),
    "Saving to collecting touch connection",
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
    "정답이에요!",
    "The three level two match connections must be correct",
  );

  await page.getByRole("button", { name: /다음 문제/ }).click();
  await page.waitForTimeout(400);
  await page.getByText("직접 확인", { exact: true }).waitFor();
  await page.getByRole("button", { name: /마음대로 그린 돈은/ }).click();
  await page.getByRole("button", { name: "정답 확인하기" }).click();
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();

  await page.getByRole("button", { name: /다음 문제/ }).click();
  await page.getByText("흐름 순서", { exact: true }).waitFor();
  for (const label of [
    "일을 해서 돈을 벌어요",
    "살 물건의 값과 가진 돈을 비교해요",
    "필요한 물건과 서비스를 이용해요",
    "돈을 모아 원하는 일을 준비해요",
  ]) {
    await page.getByRole("button", { name: new RegExp(label) }).click();
  }
  await page.getByRole("button", { name: "정답 확인하기" }).click();
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();

  await page.getByRole("button", { name: /다음 문제/ }).click();
  await page.getByText("중심 생각", { exact: true }).waitFor();
  await page.locator(".options button").first().click();
  await page.getByRole("button", { name: "정답 확인하기" }).click();
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();

  for (const prompt of [
    /저금통 친구가 보여 준 돈/,
    /돈에 대해 더 궁금한 질문/,
  ]) {
    await page.getByRole("button", { name: /다음 문제/ }).click();
    await page.locator(".reflection-question").waitFor();
    await page.getByText("힌트가 필요해요", { exact: true }).waitFor();
    await page.getByRole("button", { name: "녹음 시작하기" }).click();
    await page.getByText("목소리를 듣고 있어요…", { exact: true }).waitFor();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /다 읽었어요/ }).click();
    await page.locator(".answer-record audio").waitFor();
    await page.getByRole("button", { name: prompt }).click();
    await page.getByRole("button", { name: "내 생각 남기기" }).click();
    await page.getByRole("heading", { name: "내 생각을 잘 꺼냈어요!" }).waitFor();
  }
  await page.getByRole("button", { name: /모험 마치기/ }).click();
  await page.getByText("5 / 5", { exact: true }).waitFor();
  await page.getByText("생각 말하기 2 / 2", { exact: true }).waitFor();
  await page.getByRole("button", { name: /내 숲 보기/ }).click();
  await page.getByRole("button", { name: /책장으로 보기/ }).click();
  await page
    .getByRole("heading", { name: /한 권씩 자라는 나만의 책장/ })
    .waitFor();
  assert.equal(await page.getByRole("combobox").count(), 0);
  const shelf = page.locator(".shelf-books");
  const shelfMetrics = await shelf.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    touchAction: getComputedStyle(element).touchAction,
  }));
  assert.ok(
    shelfMetrics.scrollWidth > shelfMetrics.clientWidth,
    "The expanded bookshelf must expose horizontal overflow instead of shrinking books",
  );
  assert.match(
    shelfMetrics.touchAction,
    /^(pan-x pan-y|pan-y pan-x)$/,
    "The bookshelf must allow horizontal swipes and vertical page panning",
  );
  await swipeTouch(shelf, { x: -260, y: 0 }, "Bookshelf horizontal swipe");
  assert.ok(
    (await shelf.evaluate((element) => element.scrollLeft)) > 0,
    "A one-finger horizontal swipe must move the bookshelf",
  );
  await shelf.evaluate((element) => element.scrollTo({ left: 0, behavior: "instant" }));
  await page.locator(".shelf-book").first().click();
  await page.getByRole("heading", { name: "돈이 뭐야?" }).waitFor();
  assert.equal(await page.locator(".archive-page .story-sentences li").count(), 8);
  await page.getByText("저장된 목소리가 있어요", { exact: true }).waitFor();
  await page.locator(".saved-voice audio").waitFor();
  await page.getByRole("button", { name: /책장으로/ }).click();
  await page.goto(target, { waitUntil: "networkidle" });
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
  await page.getByText("핵심 대상", { exact: true }).first().waitFor();
  await page.getByRole("heading", { name: /방에 무엇이 찾아왔나요/ }).waitFor();
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
    page.getByRole("button", { name: /말하는 동전/ }),
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
      name: /방에 무엇이 찾아왔나요/,
    })
    .waitFor();
  await page.getByText("말하는 동전", { exact: true }).waitFor();
  assert.equal(
    await page.getByText("말하는 저금통", { exact: true }).count(),
    0,
    "The first retry screen must not reveal the correct answer",
  );
  await tapCenter(
    page.getByRole("button", { name: /다시 골라보기/ }),
    "Level one retry control",
  );
  assert.equal(
    await page.getByRole("button", { name: /말하는 동전/ }).isDisabled(),
    true,
    "The selected wrong option must stay visible but disabled on retry",
  );
  assert.equal(
    await page.locator(".options button").count(),
    4,
    "All four Lv1 options must keep their positions on retry",
  );
  await tapCenter(
    page.getByRole("button", { name: /말하는 지폐/ }),
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
    .getByText("말하는 저금통", { exact: true })
    .waitFor();
  await page
    .getByText(/방에 말하는 저금통 친구가 찾아왔어요/)
    .waitFor();
  await page.getByRole("button", { name: /다음 문제/ }).waitFor();

  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next control after level one answer feedback",
  );
  await tapCenter(
    page.getByRole("button", { name: /동전과 지폐/ }),
    "Level one second question answer",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Level one second question submit",
  );
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next control before direct information question",
  );
  await tapCenter(
    page.getByRole("button", { name: /가격과 가진 돈/ }),
    "Level one direct information answer",
  );
  await tapCenter(
    page.getByRole("button", { name: "정답 확인하기" }),
    "Level one source fact submit",
  );
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();
  await tapCenter(
    page.getByRole("button", { name: /다음 문제/ }),
    "Next control before level one matching",
  );
  await page.getByText("짝 연결", { exact: true }).waitFor();
  for (const [left, right] of [
    ["동전, 오른쪽 카드로 선 긋기", "둥근 모양"],
    ["지폐, 오른쪽 카드로 선 긋기", "네모난 모양"],
    ["저금통, 오른쪽 카드로 선 긋기", "동전을 모으는 곳"],
  ]) {
    await dragTouch(
      page.getByRole("button", { name: left, exact: true }),
      page.getByRole("button", { name: right, exact: true }),
      `Level one match: ${left} to ${right}`,
    );
  }
  assert.equal(
    await page.locator(".match-line.complete").count(),
    3,
    "Three visible lines must connect the Lv1 matching answer",
  );
  assert.deepEqual(
    await page.locator(".match-column:not(.answers) button small").allTextContents(),
    [
      "연결됨 · 둥근 모양",
      "연결됨 · 네모난 모양",
      "연결됨 · 동전을 모으는 곳",
    ],
    "Lv1 touch-drawn lines must connect each item to the intended meaning",
  );
  assert.equal(
    await page.getByRole("button", { name: "정답 확인하기" }).isEnabled(),
    true,
    "Completing all Lv1 connections must enable answer submission",
  );
  await page.getByRole("button", { name: "정답 확인하기" }).click();
  await page.locator(".feedback h1").waitFor();
  assert.equal(
    await page.locator(".feedback h1").textContent(),
    "정답이에요!",
    "The three Lv1 match connections must be correct",
  );
  await page.getByRole("button", { name: /다음 문제/ }).click();
  await page.getByText("장면 순서", { exact: true }).waitFor();
  for (const label of [
    "저금통 친구가 방에 찾아와요",
    "동전과 지폐를 보여 줘요",
    "물건을 사기 전에 가진 돈을 살펴봐요",
    "쓰지 않은 동전을 저금통에 모아요",
  ]) {
    await page.getByRole("button", { name: new RegExp(label) }).click();
  }
  assert.equal(
    await page.getByRole("button", { name: "정답 확인하기" }).isEnabled(),
    true,
    "Completing the level one sequence must enable answer submission",
  );
  await page.getByRole("button", { name: "정답 확인하기" }).click();
  await page.getByRole("heading", { name: "정답이에요!" }).waitFor();

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
