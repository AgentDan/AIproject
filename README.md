# AI Product Scene Platform

Монорепо по схеме **[Universal AI Platform v2](docs/universal_ai_platform_v2.pdf)**.

- Архитектура: [docs/architecture.md](docs/architecture.md)
- Дерево сервера: [three.md](three.md)

## Запуск

```bash
npm install
npm run dev
```

## CORS

Пакет [`cors`](https://www.npmjs.com/package/cors) в `apps/server/src/core/api/middleware.js`; политика — `CORS_ORIGIN` / `corsAllowOrigin()` в `infrastructure/config/runtime.js`.

## RAG

```bash
npm run kb:index
```

Переменные: [.env.example](.env.example).

## Production

```bash
npm run build:deploy
NODE_ENV=production npm start --workspace apps/server
```
