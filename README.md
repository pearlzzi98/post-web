# post-web

FastAPI 기반 게시판 백엔드 API 서버.

> Built with [Claude](https://claude.ai) (claude-sonnet-4-6)

---

## 기능

| 기능 | 설명 |
|------|------|
| 회원가입 / 로그인 | JWT 기반 인증, 토큰 갱신 |
| 게시글 | 작성 / 목록 / 상세(조회수) / 수정 / 삭제 |
| 파일 첨부 | 게시글에 파일 업로드 (Supabase Storage) |
| 댓글 | 게시글별 댓글 작성 / 수정 / 삭제 |
| 프로필 | 정보 수정, 프로필 사진 업로드 |
| 1:1 채팅 | WebSocket 실시간 채팅, 이력 조회 |

---

## 기술 스택

- **Python 3.12** / **FastAPI**
- **uv** — 패키지 매니저
- **Supabase** — PostgreSQL DB + Storage
- **SQLAlchemy 2.0** (async) + **asyncpg**
- **JWT** (python-jose + passlib)

---

## 프로젝트 구조

```
post-web/
├── app/
│   ├── main.py            # FastAPI 앱 진입점
│   ├── config.py          # 환경변수
│   ├── database.py        # DB 엔진/세션
│   ├── dependencies.py    # 인증 의존성
│   ├── models/            # ORM 모델
│   ├── schemas/           # Pydantic 스키마
│   ├── routers/           # API 라우터
│   └── services/          # 비즈니스 로직
├── tests/                 # 테스트 코드
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 환경 설정

`.env.example`을 복사해 `.env`를 작성한다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_KEY` | Supabase API 키 |
| `DATABASE_URL` | PostgreSQL 연결 문자열 (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | JWT 서명 키 (32자 이상) |

---

## 로컬 개발 환경

**요구사항:** Python 3.12+, [uv](https://docs.astral.sh/uv/)

```bash
# 의존성 설치
uv sync

# 개발 서버 실행
uv run uvicorn app.main:app --reload
```

서버 실행 후 API 문서: `http://localhost:8000/docs`

---

## 빌드 & 테스트

```bash
# 전체 테스트 실행 (SQLite in-memory, Supabase 불필요)
uv run pytest tests/ -v

# 특정 테스트만 실행
uv run pytest tests/test_auth.py -v
```

---

## 배포 (Ubuntu 서버)

**요구사항:** Docker, Docker Compose

```bash
# 1. 코드 가져오기
git clone <repo-url>
cd post-web

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 실제 값 입력

# 3. 실행
docker compose up -d --build

# 4. 확인
docker compose logs -f
```

서비스는 `8000` 포트로 실행된다.

---

## Supabase 초기 설정

Supabase 프로젝트의 **SQL Editor**에서 테이블을 생성해야 한다. SQL은 `docs/PLAN.md`를 참고한다.

Storage에서 `post-web-files` 버킷을 생성하고 Public 접근을 허용한다.
