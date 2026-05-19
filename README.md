# AI Product Scene Platform

Монорепозиторий: веб-клиент (Vite + React), API (Express), общие пакеты `contracts` и `ai`, опционально `apps/mobile` (Expo).

## Быстрый старт

```bash
npm install
npm run dev
```

- API: `http://localhost:3001` (или `PORT` из `.env`)
- Клиент Vite: порт из вывода (часто 5173)

## База знаний (RAG)

1. Положите исходники в `apps/server/src/knowledge-base/data/source/` (`.md`, `.txt`, `.json`).
2. Постройте индекс:

```bash
npm run kb:index
```

Переменные окружения (см. `.env.example`): `EMBEDDINGS_PROVIDER`, `EMBEDDINGS_API_KEY`, `EMBEDDINGS_MODEL`, `KB_TOP_K`, `KB_INDEX_PATH`.

**Важно:** для OpenAI-эмбеддингов индекс и запросы должны использовать одну и ту же модель/размерность (после смены провайдера переиндексируйте).

## Документация

- [Архитектура и целевое дерево](docs/architecture.md)
- Краткое дерево файлов: [three.md](three.md)

## Сборка production

```bash
npm run build
```

Сервер в `NODE_ENV=production` раздаёт статику из `apps/client/dist` (см. `CLIENT_DIST_PATH`).
