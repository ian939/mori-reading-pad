# 새 책 3권 그림 자산 만들기

> 상태: **표지·8컷 만화가 아직 임시 그림(회색 자리표시)입니다.**
> 아래 프롬프트로 진짜 그림을 만든 뒤 `public/assets/`의 같은 이름 파일을 덮어쓰면 끝납니다.

## 왜 수동인가

이 저장소에는 그림을 만드는 스크립트가 없습니다. 기존 5권의 표지와 8컷 만화도
Codex/챗 대화에 프롬프트를 넣어 받은 그림을 내려받아 커밋한 것입니다
(`README.md`의 "수동 제작 흐름"). `codex` CLI는 코드를 쓰는 도구라 그림을 만들지
못하고, `.env`에 `OPENAI_API_KEY`도 없어 서버 경로도 쓸 수 없습니다.

키를 넣으면 자동화할 수 있습니다.

```bash
# .env
OPENAI_API_KEY=sk-...
```

## 만들 파일

| 파일 | 크기 | 형식 |
|---|---|---|
| `public/assets/worry-cover-v1.png` | 1086×1448 | PNG |
| `public/assets/worry-story-comic-v1.webp` | 1600×900 | WebP |
| `public/assets/honesty-cover-v1.png` | 1086×1448 | PNG |
| `public/assets/honesty-story-comic-v1.webp` | 1600×900 | WebP |
| `public/assets/playground-cover-v1.png` | 1086×1448 | PNG |
| `public/assets/playground-story-comic-v1.webp` | 1600×900 | WebP |

임시 그림을 다시 만들려면 `node data/make-placeholders.mjs`.
진짜 그림을 다 넣은 뒤에는 `data/make-placeholders.mjs`를 지워도 됩니다.

## 공통 스타일 문장 (모든 프롬프트 앞에 붙이기)

`server/characterGenerator.js`가 쓰는 이 앱의 그림체입니다.

```
Warm children's picture-book illustration drawn with crayons and colored pencils;
slightly rough hand-drawn lines; layered wax-pencil texture; subtle paper grain;
cheerful yellow, sky blue, green, and orange palette; simple round faces, small
eyes, rosy crayon cheeks; never anime, vector, or 3D.
No text, no letters, no numbers, no speech bubbles, no logos, no watermark.
```

> **중요:** 원작 그림을 따라 그리지 않습니다. 앱 전용의 새 그림이어야 하며,
> 원작의 등장인물 디자인이 아니라 아래 장면 설명만 사용합니다.

## 1. 걱정 아저씨, 어디 가세요? (`worry`)

**표지 (1086×1448, 세로)**

```
[공통 스타일 문장]
Book cover, portrait. A round, fluffy brown bear in a white shirt, purple
trousers and a small mint-green pork-pie hat, standing on a country path. He
carries far too much: a yellow raincoat, an orange swim ring around his waist, a
pink ladder on his back, and a red wrapped gift box in one paw. Above his head
float many small brown and grey scribbly clouds, drawn like tangled pencil
scribbles, showing his worries. A tiny black-and-white dog with a blue hat walks
beside him. Sunny green hills and a winding yellow path behind. Leave the upper
third calm and uncluttered.
```

**8컷 만화 (1600×900, 4열 × 2행)**

```
[공통 스타일 문장]
One image containing exactly 8 equal panels in a 4-by-2 grid, thin white gutters,
same bear character in every panel. No text anywhere.
1. A postman bear on a bicycle drops a letter into a mailbox; the brown bear waves
   from his porch.
2. The bear stirs a wooden tub of rainbow-coloured liquid, making swirled rainbow
   soap; flower petals and sweet scent swirl around.
3. Night. The bear sits at a desk under a lamp, head in paws, surrounded by many
   scribbly worry clouds and pinned-up drawings of rain and a broken bridge.
4. Morning. The bear leaves home loaded with a yellow raincoat, an orange swim
   ring, a pink ladder and a red gift box; small animal children watch.
5. Bright cloudless sky. The bear pulls off the yellow raincoat, sweating, looking
   relieved; the raincoat drops behind him.
6. The bear crosses a green rope suspension bridge, having taken off the swim ring
   which lies behind him; he steps carefully.
7. Splash. The bear trips over the pink ladder and falls into a small stream; the
   red gift box tumbles into the water.
8. A garden birthday party. The bear blows a huge stream of rainbow soap bubbles
   from his paws; a raccoon and other animal guests cheer with delight.
```

## 2. 난 오줌 안 쌌어 (`honesty`)

**표지 (1086×1448, 세로)**

```
[공통 스타일 문장]
Book cover, portrait. A round-faced boy with short black hair, a white t-shirt
with a small yellow smiley, and blue checked shorts, standing with arms spread and
an embarrassed, flustered expression, cheeks bright red. Around him float many
gentle blue water droplets with tiny simple faces. Soft light-blue background.
Leave the lower third calm and uncluttered.
```

**8컷 만화 (1600×900, 4열 × 2행)**

```
[공통 스타일 문장]
One image containing exactly 8 equal panels in a 4-by-2 grid, thin white gutters,
same boy character in every panel. Kindergarten setting. No text anywhere.
1. A classroom. The boy points and laughs at another child sitting on the floor
   who is crying, with a small puddle nearby.
2. Story time. Children sit on small chairs facing a teacher; the boy squirms and
   twists his legs, holding it in.
3. A corridor. The boy hurries toward a restroom door with legs pressed together,
   a sweat drop on his cheek.
4. The boy stands frozen just outside the restroom door, wide-eyed, a small puddle
   at his feet and his shorts darkened.
5. Daydream: the boy sits in a sunny field imagining his shorts drying on a
   clothesline under a smiling sun, looking hopeful then glum.
6. Daydream: the boy stands in falling rain, then imagines himself shivering with
   a thermometer, worried about getting sick.
7. The classroom again. Children crowd around the boy, laughing and pointing; the
   boy shouts with his eyes squeezed shut, close to tears.
8. A kind teacher in a blue apron kneels and hugs the boy; then the boy and the
   child from panel 1 walk away hand in hand, both smiling.
```

## 3. 놀이터 귀신 (`playground`)

**표지 (1086×1448, 세로)**

```
[공통 스타일 문장]
Book cover, portrait. Evening playground. A small boy with a big dark bowl-cut
hairstyle and round glasses crouches in the foreground, hugging his knees and
looking up nervously. Behind him, a dark stone wall with a small round hole; from
the hole spills a soft glow and two tiny points of light. Deep blue-grey dusk sky
with scribbly pencil texture, a green trellis pavilion and slim trees. Gently
mysterious, not frightening. Leave the upper third calm.
```

**8컷 만화 (1600×900, 4열 × 2행)**

```
[공통 스타일 문장]
One image containing exactly 8 equal panels in a 4-by-2 grid, thin white gutters,
same three children in every panel. Gently spooky but never scary. No text.
1. Dusk playground. A boy with a big dark bowl-cut hides behind a wooden bench,
   grinning; two friends search in the distance.
2. Close on a small round hole in a stone wall; a faint glow and two tiny points
   of light shine out of the darkness; the boy peers in, startled.
3. Three children lean toward the hole together, then bolt away screaming with
   arms flailing, four little lights glowing behind them.
4. Night bedroom. The boy hides under a blanket; above him swirl imagined orange
   scribbly goblin shapes with big grins.
5. A clinic waiting room. Three children with red spots on their cheeks hold hands
   sadly while a mother talks to a nurse at a counter.
6. Dusk again. The three children march bravely toward the playground carrying a
   stick, a cloth sack and a flashlight, wearing brave paper masks.
7. Something small leaps out of the hole; the children flee down an alley and run
   straight into a tall father in a long coat.
8. The father shines a flashlight into the hole, revealing a tiny striped kitten
   crying; the children crouch and smile, and two kittens play at their feet.
```

## 넣는 방법

1. 위 프롬프트로 그림을 받아 내려받습니다.
2. 크기가 다르면 맞춥니다.
   ```bash
   npx sharp-cli -i 내려받은표지.png -o public/assets/worry-cover-v1.png resize 1086 1448
   ```
   또는 Node에서 `sharp(input).resize(1086,1448).png().toFile(...)`.
   만화는 `.resize(1600,900).webp({quality:84})`로 저장합니다.
3. `public/assets/`의 같은 이름 파일을 덮어씁니다.
4. 확인:
   ```bash
   npm run build
   npm run preview -- --port 5174
   TOUCH_TEST_URL="http://127.0.0.1:5174/mori-reading-pad/" npm run verify:touch
   ```
