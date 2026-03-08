# CLAUDE.md — post-web 프로젝트 가이드

## 세션 재개 (/resume)

사용자가 새 세션에서 이전 작업을 이어가려고 할 때 (예: "이어서 해줘", "resume", "/resume"),
**반드시 먼저** 다음 두 파일을 읽어 컨텍스트를 복원하라:

1. **`docs/MEMORY.md`** — 프로젝트 현재 상태, 기술 스택, 주의사항
2. **`docs/PLAN.md`** — 최근 플랜 및 완료/진행 상태

복원 후 사용자에게 다음을 요약하여 전달하라:
- 프로젝트 현재 상태
- 마지막으로 완료된 작업
- 진행 중이거나 미완료 항목 (있는 경우)
- 이어서 할 작업 확인

## /compact 실행 전 필수 작업

사용자가 `/compact`를 실행하면 **반드시 먼저** 다음 두 파일을 최신 상태로 업데이트하라:

1. **`docs/MEMORY.md`** — 프로젝트의 현재 상태 반영
2. **`docs/PLAN.md`** — 플랜의 완료/진행 상태 반영

업데이트 후 `/compact`를 진행하라.

## Git 커밋 컨벤션

커밋 메시지는 **타입 prefix(영어) + 본문(한국어)** 형식을 따른다.

### 형식
```
<type>: <변경 내용 요약 (한국어)>
```

### 타입 목록
| 타입 | 용도 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 (README, CLAUDE.md 등) |
| `style` | 코드 포맷, 디자인 변경 (기능 변경 없음) |
| `refactor` | 리팩토링 (기능/버그 변경 없음) |
| `chore` | 빌드, 설정 파일 변경 (.gitignore 등) |

### 예시
```
feat: 컨택 폼 유효성 검사 추가
fix: 네비게이션 스크롤 오프셋 수정
docs: README 배포 URL 업데이트
style: 히어로 섹션 간격 조정
chore: .gitignore에 docs/ 추가
```

### 규칙
- 제목 끝에 마침표 없음
- 현재형 동사 사용 ("추가했다" → "추가")
- 50자 이내로 작성

### 커밋/푸쉬 실행 트리거

| 트리거 | 동작 |
|--------|------|
| "commit", "커밋" | `git commit`만 수행 |
| "push", "푸쉬" | `git push`만 수행 |
| "commit&push", "커푸" | `git commit` + `git push` 순서대로 수행 |

**커밋 수행 시 절차:**
1. `git status`와 `git diff`로 변경 사항 확인
2. 위 컨벤션에 맞는 커밋 메시지 작성
3. `git add` 후 `git commit` 실행

---

## 기술 스택

- **언어**: Python 3.12 / **프레임워크**: FastAPI / **패키지 매니저**: uv
- **DB**: Supabase (PostgreSQL + asyncpg + SQLAlchemy 2.0)
- **파일 저장**: Supabase Storage (supabase-py)
- **인증**: JWT (python-jose + passlib + bcrypt)
- **로컬 실행**: uvicorn --reload / **배포**: Docker (docker-compose, Ubuntu)

## 핵심 패키지 주의사항

- `supabase` 패키지: **`<2.10.0`** 고정 (2.10+ 이상은 pyiceberg → C++ 빌드 필요)
- `bcrypt` 패키지: **`<4.0.0`** 고정 (4.0+ 이상은 passlib 1.7.4와 호환 안됨)
- 모델 UUID 타입: `sqlalchemy.Uuid` 사용 (`postgresql.UUID` 쓰면 SQLite 테스트 실패)
- 채팅: 단일 서버, 메모리 내 WebSocket Dict 관리 (Redis 없음)

## 프로젝트 구조

```
post-web/
├── app/
│   ├── main.py
│   ├── config.py          # pydantic-settings
│   ├── database.py        # SQLAlchemy async engine
│   ├── dependencies.py    # JWT 인증 의존성
│   ├── models/            # ORM 모델 (User, Post, PostFile, Comment, ChatMessage)
│   ├── schemas/           # Pydantic 스키마
│   ├── routers/           # auth, posts, comments, files, profile, chat
│   └── services/          # auth.py (JWT/bcrypt), storage.py (Supabase Storage)
├── tests/                 # pytest + aiosqlite (in-memory)
├── docs/                  # MEMORY.md, PLAN.md (gitignored)
├── .env.example
├── pyproject.toml
├── Dockerfile
└── docker-compose.yml
```

## 로컬 실행 / 테스트

```bash
# 서버 실행
uv run uvicorn app.main:app --reload

# 테스트 실행 (14/14 통과 확인됨)
uv run pytest tests/ -v
```

## API 엔드포인트 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /auth/register | 회원가입 |
| POST | /auth/login | 로그인 (JWT 발급) |
| POST | /auth/refresh | 토큰 갱신 |
| GET/POST | /posts | 게시글 목록/작성 |
| GET/PATCH/DELETE | /posts/{id} | 게시글 상세/수정/삭제 |
| GET/POST | /posts/{id}/comments | 댓글 목록/작성 |
| PATCH/DELETE | /posts/{id}/comments/{cid} | 댓글 수정/삭제 |
| POST/DELETE | /posts/{id}/files | 파일 업로드/삭제 |
| GET | /users/{id} | 프로필 조회 |
| PATCH | /users/me | 프로필 수정 |
| POST | /users/me/avatar | 아바타 업로드 |
| GET | /chat/history | 채팅 이력 조회 |
| WS | /ws/chat?token= | 실시간 채팅 |

---

## docs/ 디렉토리

- `docs/PLAN.md` — 세션 플랜 기록 (gitignore 처리)
- `docs/MEMORY.md` — 프로젝트 메모리 (gitignore 처리)
- Git에 커밋되지 않음 (`.gitignore`에 `docs/` 포함)

## 보안 주의사항

- `.env` 파일은 절대 커밋하지 않음 (`.gitignore` 포함)
- `.gitignore`에 포함된 항목은 커밋 전 반드시 확인
- 보안상 민감한 파일이 포함될 경우 사용자에게 먼저 확인 후 커밋
