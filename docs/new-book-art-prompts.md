# 새 책 3권 그림 자산 프롬프트

> 상태: **표지 3장과 8컷 그림 3장을 생성해 앱에 반영했습니다.**
> 이 문서는 같은 자산을 다시 만들거나 후속 버전을 만들 때 쓰는 최종 프롬프트 사양입니다.

## 결과 파일

| 책 | 표지 3:4 PNG | 8컷 16:9 WebP |
|---|---|---|
| 걱정 아저씨, 어디 가세요? | `public/assets/worry-cover-v1.png` (1086×1448) | `public/assets/worry-story-comic-v1.webp` (1600×900) |
| 난 오줌 안 쌌어 | `public/assets/honesty-cover-v1.png` (1086×1448) | `public/assets/honesty-story-comic-v1.webp` (1600×900) |
| 놀이터 귀신 | `public/assets/playground-cover-v1.png` (1086×1448) | `public/assets/playground-story-comic-v1.webp` (1600×900) |

## 공통 제작 원칙

- `cold`, `bicycle`, `transport`의 표지와 기존 8컷 이미지는 **질감·격자·완성도 참고**로만 사용한다.
- 원작 표지, 등장인물 외형, 의상, 구도, 장면을 복제하지 않는다.
- 표지는 앱이 제목을 올릴 수 있도록 위쪽 약 1/3을 차분하고 비워 둔다.
- 8컷은 한 이미지 안에 **같은 크기의 4열×2행**을 만들고, 흰색 직선 여백으로 구분한다.
- 8컷은 책을 대체하는 상세 줄거리 대신 핵심 개념을 떠올리는 시각적 기억 단서로 만든다.
- 이미지 안에는 글자, 숫자, 말풍선, 로고, 워터마크를 넣지 않는다.

## 공통 스타일 프롬프트

```text
Use case: illustration-story
Style/medium: warm children's picture-book illustration drawn with crayons and
colored pencils; visibly layered wax-pencil strokes; slightly rough hand-drawn
outlines; subtle warm cream paper grain; simple round faces, small eyes, rosy
crayon cheeks; cheerful yellow, sky blue, green, coral and teal palette; never
anime, vector, glossy, or 3D.
Constraints: brand-new app-only characters and composition; no text, letters,
numbers, captions, speech bubbles, logos, publisher marks, or watermark; do not
copy any published book cover, character, costume, composition, or illustration.
```

## 1. 걱정 아저씨, 어디 가세요? (`worry`)

### 표지

```text
[공통 스타일 프롬프트]
Asset type: 3:4 portrait cover for a children's reading tablet app.
Scene: a sunny countryside path, gentle green hills and tiny wildflowers.
Subject: one original round cinnamon-brown raccoon adult with small dark eye-mask
markings, coral cap, teal knitted vest, cream shirt and mustard trousers. The
raccoon carries a folded yellow raincoat, a small orange swim float, a short
lavender step stool tied to a backpack and a red wrapped gift. Soft tangled-pencil
worry clouds gradually loosen into calm blue curved lines above the character.
Composition: full body in the lower two-thirds; quiet cream negative space in the
upper third. Bright, reassuring and playful; all objects readable at thumbnail size.
```

### 8컷 그림

```text
[공통 스타일 프롬프트]
Asset type: one 16:9 visual memory aid containing exactly eight equal panels in a
strict 4-column by 2-row grid with thin straight white gutters. Preserve the same
raccoon, face markings and wardrobe in every panel.
1. The raccoon receives a colorful invitation envelope at a porch mailbox.
2. At a craft table, the raccoon prepares a rainbow bubble gift in a wooden bowl.
3. At night, pictorial worry clouds show rain, a footbridge and a long path.
4. The raccoon starts out with an overloaded backpack and preparation items.
5. Under a clear sky, the raccoon checks the weather and sets aside the raincoat.
6. At a safe footbridge, a generic park helper points out the sturdy handrail.
7. The raccoon sorts the gear, keeps only useful items and walks more lightly.
8. At a garden gathering, the raccoon makes rainbow bubbles as animal friends clap.
Mood: mild worry becomes calm confidence. No copied story composition.
```

## 2. 난 오줌 안 쌌어 (`honesty`)

### 표지

```text
[공통 스타일 프롬프트]
Asset type: 3:4 portrait cover for a children's reading tablet app.
Scene: a softly simplified kindergarten hallway outside an open restroom doorway.
Subject: one original round-faced kindergarten child with softly wavy dark-brown
bob hair, a coral cardigan, mustard shirt, loose teal trousers and red sneakers.
The child holds both hands near the chest, looks a little embarrassed but gathers
courage. Pale-blue brush marks curve upward into warm golden heart-like marks.
Composition: full body in the lower two-thirds and calm sky-blue/cream negative
space in the upper third. Safe, private, validating and non-shaming.
Constraints: no puddle, no visible wet clothing, no exposed body, no ridicule.
```

### 8컷 그림

```text
[공통 스타일 프롬프트]
Asset type: one 16:9 visual memory aid containing exactly eight equal panels in a
strict 4-column by 2-row grid with thin straight white gutters. Preserve the same
child and outfit in every panel.
1. During kindergarten story time, the child notices a body signal and raises a hand.
2. The child walks quickly but safely toward an open restroom doorway.
3. Outside the doorway, the child looks embarrassed; only two tiny pale-blue drops
   appear by one shoe, with no wet clothing or exposed body.
4. In a quiet corner, the child breathes as a tangled blue line begins to loosen.
5. The child practices honest words with hand gestures in front of a small mirror.
6. The child privately tells a kind teacher, who kneels and listens at eye level.
7. The teacher discreetly offers folded clean clothes and a towel.
8. The relieved child builds blocks with a friend; a golden heart mark suggests trust.
Mood: gentle and reassuring, with zero teasing, pointing, crowding or humiliation.
```

## 3. 놀이터 귀신 (`playground`)

### 표지

```text
[공통 스타일 프롬프트]
Asset type: 3:4 portrait cover for a children's reading tablet app.
Scene: an early-evening community playground with a low stone garden wall, slim
trees, a simple climbing frame and a small round opening near the ground.
Subject: one original child with short curly dark hair, round amber glasses,
mustard hoodie, teal shorts over leggings, red sneakers and a blue backpack. The
child kneels at a safe distance, holding a flashlight near the chest and looking
curiously at two tiny warm reflections in the opening.
Composition: child and opening in the lower two-thirds; calm blue-cream negative
space in the upper third. Gently mysterious, cozy and never frightening.
Constraints: no ghost, monster, horror face, weapon or unsafe approach.
```

### 8컷 그림

```text
[공통 스타일 프롬프트]
Asset type: one 16:9 visual memory aid containing exactly eight equal panels in a
strict 4-column by 2-row grid with thin straight white gutters.
Cast: keep the cover child consistent. Friend A has two short black pigtails, a
coral jacket and lavender trousers. Friend B has straight brown hair, a green
cardigan and blue trousers. A trusted father wears a navy jacket and beige trousers.
1. The three children play hide-and-seek near a playground bench.
2. From a safe distance, the main child notices a rustle and warm reflections in
   a small opening in the low wall.
3. The children step back, point from a distance and describe what they observed.
4. At home, the child draws the wall and explains the concern to the father.
5. The father listens and prepares a flashlight and phone while the children wait.
6. Together they return and stop behind a clear safe boundary.
7. The father checks the opening while the children stay behind; a kitten appears.
8. In the open playground, the kitten drinks water as everyone relaxes.
Mood: curiosity becomes calm understanding; the adult handles the investigation.
```

## 다시 생성해 넣는 방법

1. 각 자산의 프롬프트에 공통 스타일 프롬프트를 합쳐 이미지 생성 도구에 넣는다.
2. 표지에는 기존 표지 2~3개를, 8컷에는 해당 표지와 기존 8컷 2개를 스타일 참고 이미지로만 준다.
3. 표지는 `1086×1448` PNG, 8컷은 `1600×900` WebP(quality 84)로 변환한다.
4. 같은 파일명을 교체한 뒤 `artStatus: "preparing"`이 다시 들어가지 않았는지 확인한다.
5. `npm test`, `npm run build`, `npm run verify:touch`로 검증한다.
