# 모리의 책숲

책을 읽고 퀴즈를 풀며 나만의 책장과 이야기 도감을 키우는 어린이 문해력 웹앱입니다.

현재 MVP에는 두 권의 샘플 책과 책마다 두 단계의 10문항 퀴즈가 있습니다.
`Lv.1`은 선택·연결·순서·그림 단서 중심이고, `Lv.2`는 Completion·Recall·
Wh-question·Open-ended·Distancing을 각 2문항씩 제공합니다. 난이도는 `내 모리`에서
선택하며 레벨별 완독 기록을 따로 저장합니다.

퀴즈 전에는 새로 만든 글자 없는 8컷 만화와 컷별 핵심 문장을 따라 읽고, 퀴즈 후에는
짧은 줄거리를 소리 내어 녹음합니다. 녹음은 브라우저 IndexedDB에만 저장되며, 도감에서
줄거리와 함께 다시 듣거나 재녹음·삭제할 수 있습니다. 도감은 최근 읽은 순서로 정렬하고
출판사·시리즈·주제 필터를 제공합니다.

책 등록 화면에서는 표지와 본문 사진을 최대 40장까지 순서대로 올릴 수 있습니다.
Node API가 이미지를 정방향 JPEG로 정리한 뒤 AI 비전 분석을 실행하고, SQLite DB에
제목·저자·그림 작가·번역자·출판사·ISBN·발행일과 페이지별 본문·전체 본문을 저장합니다.

## 실행

```bash
npm install
copy .env.example .env
# .env의 OPENAI_API_KEY 값을 설정
npm run dev
```

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
GET  /api/books/:id             메타데이터·페이지별 본문·전체 본문
POST /api/books/:id/reprocess   분석 재시도
GET  /api/health                서버 및 분석기 설정 상태
```

업로드 순서의 첫 이미지를 표지로 취급합니다. 이미지 한 장의 제한은 18MB이며,
저장 전 회전 정보를 반영하고 긴 변을 최대 2200px로 정리합니다. `data/`와 `.env`는
Git에 포함되지 않습니다.

## 배포

`main` 브랜치에 변경사항을 푸시하면 GitHub Actions가 빌드하고 GitHub Pages에 자동 배포합니다.

GitHub Pages는 정적 호스팅이므로 Node API와 SQLite를 실행하지 못합니다. 운영 시 API는
Render, Railway, Fly.io 같은 영구 디스크를 제공하는 Node 호스트에 별도로 배포하고,
GitHub 저장소의 Actions 변수 `VITE_API_BASE_URL`에 API 주소를 등록해야 합니다.
API 서버에는 `ALLOWED_ORIGINS=https://ian939.github.io`도 설정합니다.

- 서비스: https://ian939.github.io/mori-reading-pad/
- 제품 및 개발 계획: [플랜.md](./플랜.md)
