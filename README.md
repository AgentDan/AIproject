# AI Product Scene Platform

Монorepo по схеме **Universal AI Platform v2**.

- Roadmap интеграции: [docs/roadmap-integration-admin-configurator.md](docs/roadmap-integration-admin-configurator.md)
- API: [docs/api-overview.md](docs/api-overview.md)
- **Production:** [docs/deploy-production.md](docs/deploy-production.md)

## Development

```bash
npm install
cp .env.example .env   # при необходимости
npm run dev
```

- Клиент: http://localhost:5173
- API: http://localhost:3001

## Production (один процесс)

```bash
npm ci
npm run build:deploy
NODE_ENV=production npm start
```

Сервер отдаёт `apps/client/dist` (SPA) и `/api/*` на одном порту (`PORT`, по умолчанию 3001).

Обязательно в `.env`: `JWT_SECRET`, при auth/admin — `MONGO_URI`, при S3/R2 — `BUCKET_NAME` и ключи. См. [.env.example](.env.example).

## RAG

```bash
npm run kb:index
```

## CORS

Пакет `cors` в `apps/server/src/core/api/middleware.js`; в production задайте `CORS_ORIGIN` при отдельном origin клиента.
