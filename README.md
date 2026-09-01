# 모리의 책숲

책을 읽고 퀴즈를 풀며 완독한 책을 나만의 책장에 모으는 어린이 문해력 웹앱입니다.

현재 MVP에는 두 권의 샘플 책과 책마다 두 단계의 10문항 퀴즈가 있습니다.
`Lv.1`은 선택·연결·순서·그림 단서 중심이고, `Lv.2`는 Completion·Recall·
Wh-question·Open-ended·Distancing을 각 2문항씩 제공합니다. 난이도는 `내 캐릭터`에서
선택하며 레벨별 완독 기록을 따로 저장합니다.

`내 캐릭터`에서는 보호자가 아이 이름과 사진을 등록한 뒤, 같은 아이가 책을 읽는
크레파스·색연필 그림책 캐릭터 8가지를 만들 수 있습니다. 모자와 옷이 서로 다른
후보 중 하나를 고르면 홈 제목이 `지온이의 책장`처럼 바뀌고, 기존 모리 자리와
상단 프로필에도 선택한 캐릭터가 표시됩니다. 원본 사진은 홈에 사용하지 않습니다.

선택한 캐릭터는 이야기 속 주인공으로도 등장합니다. 책마다 `hero`(주인공)·`guide`
(길잡이) 캐스트를 두어, 특정 출판물의 고유 캐릭터 대신 아이의 캐릭터(기본 `모리`)와
중립적인 역할 이름을 넣습니다. 이름 뒤 조사는 받침 유무에 맞춰 자동으로 바뀝니다.
저작권을 위해 도입한 방식으로, 캐스트가 없는 책은 원문 그대로 표시합니다.

MVP와 GitHub Pages에서는 API 호출 대신 아이 사진을 Codex 대화에 첨부해 2×4
캐릭터 시트를 만들고, 완성된 시트 한 장을 프로필에서 불러옵니다. 브라우저가 시트를
8개로 직접 나누므로 앱 실행 중 API 키나 이미지 생성 비용이 들지 않습니다. 이는
줄거리 만화를 프로젝트 자산으로 미리 만드는 방식과 같은 수동 제작 흐름입니다.

퀴즈 전에는 새로 만든 글자 없는 8컷 만화와 컷별 핵심 문장을 따라 읽고, 퀴즈 후에는
짧은 줄거리를 소리 내어 녹음합니다. 녹음은 브라우저 IndexedDB에만 저장됩니다. 완독한
책은 `내 책장` 선반에 최근 읽은 순서로 꽂히고, 선반에서 책을 누르면 그 책의 8컷 만화를
다시 보며 줄거리를 다시 듣거나 재녹음·삭제할 수 있습니다.

책 등록 화면에서는 표지와 본문 사진을 최대 40장까지 순서대로 올릴 수 있습니다.
Node API가 이미지를 정방향 JPEG로 정리한 뒤 AI 비전 분석을 실행합니다. 저작권 보호를 위해
**책 본문 텍스트는 저장하지 않고 분석 중에만 사용**하며, SQLite DB에는 제목·저자·그림 작가·
번역자·출판사·ISBN·발행일과 페이지 구조(종류·인쇄 쪽번호), 분석한 글자 수만 남깁니다.
분석이 끝나면 **표지 사진 한 장만 남기고 나머지 페이지 이미지는 삭제**합니다.

## 실행

```bash
npm install
copy .env.example .env
# .env의 OPENAI_API_KEY 값을 설정
npm run dev
```

향후 자동 생성 서비스에서는 `VITE_CHARACTER_GENERATION_MODE=api`로 바꿉니다.
그러면 `OPENAI_IMAGE_MODEL`(기본값 `gpt-image-2`)로 한 장의 2×4 캐릭터 시트를 만든
뒤 서버에서 8개의 WebP로 나눕니다. 업로드된 사진은 EXIF와 방향 정보를 제거하고
최대 1024px로 줄여 전송하며, 요청이 끝나면 서버 임시 업로드를 삭제합니다. 수동·API
방식 모두 브라우저에는 원본과 생성 이미지를 사용자별 IndexedDB에 저장합니다.

별도 터미널에서 `npm test`, `npm run build`, `npm run verify:touch`로 API 저장 흐름,
프로덕션 빌드, iPad 터치 보호와 파일 선택 동작을 확인할 수 있습니다.

- 웹: `http://localhost:5173/mori-reading-pad/`
- API: `http://localhost:8787/api/health`
- DB 기본 위치: `data/mori.sqlite`
- 정리된 책 이미지: `data/uploads/<book-id>/`

API 키가 없는 상태에서도 사진과 등록 레코드는 저장됩니다. 이때 상태는
`needs_configuration`이며, 키를 설정하고 `POST /api/books/:id/reprocess`를 호출하면
분석을 이어서 할 수 있습니다.

## 책 등록 API

```text
POST /api/books                 multipart 필드 pages, 최대 40장
GET  /api/books                 등록 목록
GET  /api/books/:id             메타데이터·페이지 구조·분석한 글자 수 (본문 원문 없음)
POST /api/books/:id/reprocess   분석 재시도
POST /api/characters/generate   multipart 필드 photo, 책 읽는 캐릭터 8종 생성
GET  /api/health                서버 및 분석기 설정 상태
```

`MORI_API_TOKEN`을 설정하면 `/api/health`를 제외한 모든 요청(등록·조회·재분석)에
`Authorization: Bearer <토큰>` 헤더가 필요합니다. 토큰이 없으면 로컬 개발용으로 열려 있습니다.
읽기까지 막고 싶다면 토큰을 설정한 비공개(보호자 전용) 배포로 운영하세요.

업로드 순서의 첫 이미지를 표지로 취급합니다. 이미지 한 장의 제한은 18MB이며,
저장 전 회전 정보를 반영하고 긴 변을 최대 2200px로 정리합니다. `data/`와 `.env`는
Git에 포함되지 않습니다.

## 배포

`main` 브랜치에 변경사항을 푸시하면 GitHub Actions가 빌드하고 GitHub Pages에 자동 배포합니다.

GitHub Pages는 정적 호스팅이므로 Node API와 SQLite를 실행하지 못합니다. 운영 시 API는
Render, Railway, Fly.io 같은 영구 디스크를 제공하는 Node 호스트에 별도로 배포하고,
GitHub 저장소의 Actions 변수 `VITE_API_BASE_URL`에 API 주소를 등록해야 합니다.
API 서버에는 `ALLOWED_ORIGINS=https://ian939.github.io`도 설정합니다.

현재 프로필·책·진행 기록은 로컬 익명 사용자 UUID 아래에 분리해 저장합니다. 향후
Supabase 로그인 도입을 위한 테이블, private Storage, RLS 전환안은
[Supabase 데이터 전환 설계](./docs/supabase-data-model.md)에 정리했습니다.

- 서비스: https://ian939.github.io/mori-reading-pad/
- 제품 및 개발 계획: [플랜.md](./플랜.md)
