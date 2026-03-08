# post-web

FastAPI + Vite/React 기반 풀스택 게시판 서비스.

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
| 1:1 채팅 | WebSocket 실시간 채팅 (Redis pub/sub), 이력 조회 |

---

## 기술 스택

### Backend
- **Python 3.12** / **FastAPI** / **uv**
- **Supabase** — PostgreSQL DB + Storage
- **SQLAlchemy 2.0** (async) + **asyncpg**
- **JWT** (python-jose + passlib)
- **Redis** — pub/sub 기반 실시간 채팅

### Frontend
- **Vite + React 18 + TypeScript**
- **React Router v6** / **Zustand** / **TailwindCSS**

### 인프라
- **Docker + docker-compose** (redis / backend / frontend)
- **k8s/kind** — blue-green 배포 지원

---

## 프로젝트 구조

```
post-web/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/     # auth, posts, comments, files, profile, chat
│   │   └── services/    # auth.py, storage.py, redis_client.py
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── api/         # fetch 래퍼
│   │   ├── components/
│   │   ├── pages/       # 9개 페이지
│   │   ├── store/       # Zustand
│   │   └── types/
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── redis.yaml
│   └── ingress.yaml
├── docker-compose.yml
└── .env.example
```

---

## 환경 설정

루트의 `.env.example`을 복사해 `.env`를 작성한다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | JWT 서명 키 (32자 이상) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 |

---

## 로컬 개발 환경

**요구사항:** Python 3.12+, [uv](https://docs.astral.sh/uv/), Node.js 20+

```bash
# 백엔드 서버 실행
cd backend
uv sync
uv run uvicorn app.main:app --reload

# 프론트엔드 개발 서버 (별도 터미널)
cd frontend
npm install
npm run dev
```

- 백엔드 API 문서: `http://localhost:8000/docs`
- 프론트엔드: `http://localhost:5173`

---

## 테스트

```bash
cd backend
uv run pytest tests/ -v
```

---

## Docker로 실행

```bash
# 전체 스택 실행 (redis + backend + frontend)
docker compose up --build

# 백그라운드 실행
docker compose up -d --build
```

- 프론트엔드: `http://localhost:3000`
- 백엔드 API: `http://localhost:8000`

---

## k8s 배포 (kind)

```bash
# 이미지 빌드
docker build -t post-web-backend:latest ./backend
docker build -t post-web-frontend:latest ./frontend

# kind 클러스터에 이미지 로드
kind load docker-image post-web-backend:latest
kind load docker-image post-web-frontend:latest

# Secret 생성
kubectl create secret generic backend-secret \
  --from-literal=DATABASE_URL=... \
  --from-literal=SECRET_KEY=... \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL=... \
  --from-literal=NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY=...

# 매니페스트 적용
kubectl apply -f k8s/
```

---

## Supabase 초기 설정

Supabase 프로젝트의 **SQL Editor**에서 테이블을 생성해야 한다. SQL은 `docs/PLAN.md`를 참고한다.

Storage에서 `post-web-files` 버킷을 생성하고 Public 접근을 허용한다.
