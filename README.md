# AI Product Scene Platform

Монорепозиторий в духе **Universal AI Platform v2**: клиент, Platform Core, AI Runtime, Knowledge Base, **`workflow-engine`** и доменный плагин **`domain-modules/configurator-3d`** (3D / GLTF).

**Архитектура:** [docs/architecture.md](docs/architecture.md) · схема [docs/universal_ai_platform_v2.pdf](docs/universal_ai_platform_v2.pdf)

## Быстрый старт

```bash
npm install
npm run dev
```

- API: `http://localhost:3001` (или `PORT` из `.env`)
- Клиент Vite — порт в выводе терминала

## RAG (база знаний)

Исходники в `apps/server/src/knowledge-base/data/source/`, затем:

```bash
npm run kb:index
```

Переменные: см. `.env.example` (`EMBEDDINGS_PROVIDER`, `EMBEDDINGS_API_KEY`, `KB_TOP_K`, `KB_INDEX_PATH`).

## Сборка production

```bash
npm run build
```

Сервер в `NODE_ENV=production` отдаёт статику из `apps/client` (путь см. `core/api/middleware.js` — `CLIENT_DIST_PATH`).
