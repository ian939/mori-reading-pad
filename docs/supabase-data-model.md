# Supabase 사용자 데이터 전환 설계

현재 버전은 로그인 없이 `mori-session-v1`에 만든 익명 UUID를 사용자 키로 사용한다.
localStorage의 설정·진행 데이터와 IndexedDB의 사진·캐릭터·녹음은 모두 이 UUID로
범위를 나눈다. 화면과 저장 함수가 `userId`를 명시적으로 전달하므로, 로그인 도입
시 저장소 구현만 Supabase repository로 교체한다.

## 권장 테이블

| 테이블 | 주요 열 | 용도 |
| --- | --- | --- |
| `profiles` | `user_id` PK/FK, `child_name`, `selected_variant_id`, `quiz_level`, `updated_at` | 아이 프로필과 기본 난이도 |
| `character_variants` | `id`, `user_id`, `label`, `description`, `storage_path`, `created_at` | 생성된 8개 후보와 선택 상태 |
| `reading_progress` | `user_id`, `book_id`, `quiz_level`, `completed_at`, `stars` | 사용자·책·레벨별 진행 |
| `user_books` | `user_id`, `book_id`, `read_at`, `review_status` | 사용자의 도감과 읽은 날짜 |
| `recordings` | `id`, `user_id`, `book_id`, `quiz_level`, `storage_path`, `created_at` | 줄거리 낭독 녹음 |

모든 사용자 소유 테이블은 `user_id = auth.uid()` 조건으로 SELECT, INSERT, UPDATE,
DELETE RLS 정책을 둔다. 브라우저가 보낸 사용자 ID나 `X-Mori-User-Id`를 권한 근거로
신뢰하지 않고, API 서버에서 검증한 Supabase JWT의 `sub`를 사용한다.

## Storage

- `child-source-photos`: private. 생성 작업 동안만 두고 완료·실패 즉시 삭제한다.
- `character-variants`: private. `user_id/variant-id.webp` 구조로 저장한다.
- `recordings`: private. `user_id/book-id/level.webm` 구조로 저장한다.
- 앱은 짧은 수명의 signed URL만 받아 표시한다. public bucket을 사용하지 않는다.

## 로그인 도입 순서

1. Supabase Auth 로그인 후 `auth.users.id`를 현재 `CURRENT_USER.id` 대신 사용한다.
2. 최초 로그인 때 로컬 익명 데이터가 있으면 보호자 확인을 받은 뒤 한 번만 계정으로
   복사하고 `migrated_from_local_id`를 기록한다.
3. `userDataStore.js`, `profileMediaStore.js`, `audioStore.js` 구현을 Supabase repository로
   교체하되 호출부의 `userId` 인터페이스는 유지한다.
4. 캐릭터 생성 API는 Authorization JWT를 검증하고 그 `sub`만 이미지 생성 요청과
   Storage 경로에 사용한다.
5. 마이그레이션 후 로컬의 원본 사진은 보호자 선택에 따라 지우거나 오프라인 캐시로
   유지한다. 계정 로그아웃 시 object URL과 민감 캐시를 해제한다.

현재 `X-Mori-User-Id`는 로컬 개발에서 생성 요청을 구분하기 위한 안전 태그일 뿐,
인증 수단이 아니다.
