# Production deploy — AI Product Scene Platform

Один процесс Node.js отдаёт **API + SPA** (`apps/client/dist`). Dev: Vite `:5173` + API `:3001`.

## 1. Сборка на сервере

```bash
git pull
npm ci
npm run build:deploy
```

`build:deploy` = packages/ai + RAG index + client Vite build → `apps/client/dist`.

## 2. Переменные окружения

Скопируйте [.env.example](../.env.example) в `.env` в **корне репозитория**.

| Переменная | Production |
|------------|------------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` (или за nginx) |
| `HOST` | `0.0.0.0` |
| `CORS_ORIGIN` | `https://your-domain.com` (если API отдельно; при одном origin можно `*`) |
| `JWT_SECRET` | **обязательно** (случайная строка) |
| `MONGO_URI` | MongoDB для auth/admin |
| `BUCKET_NAME`, `S3_ENDPOINT`, `AWS_*` | Cloudflare R2 / S3 |
| `CLIENT_DIST_PATH` | опционально, по умолчанию `apps/client/dist` |
| `SERVER_STORAGE_DIR` | опционально, сессии AI (writable path) |

После смены markdown в `knowledge-base/data/source/`:

```bash
npm run kb:index
```

## 3. Запуск

```bash
NODE_ENV=production npm start
# или
NODE_ENV=production npm start --workspace apps/server
```

Проверка:

- `GET /health` → 200
- `GET /` → SPA (index.html)
- `GET /api` → список эндпоинтов

## 4. Nginx (reverse proxy)

Пример для домена `example.com`, Node на `127.0.0.1:3001`:

```nginx
server {
    listen 80;
    server_name example.com;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

TLS — certbot / Cloudflare. Для WebSocket (если появится realtime) добавьте `Upgrade` headers.

## 5. Миграция с legacy (`89.168.87.13`)

1. Остановить старый `mvp3dcursor` process (legacy `src/server.js`).
2. Развернуть monorepo в один каталог, например `/var/www/ai-product-scene-platform`.
3. Перенести `.env`: `MONGO_URI`, R2 keys, `JWT_SECRET`.
4. GLTF: положить в `apps/server/gltf/` или только R2.
5. `npm run build:deploy && NODE_ENV=production npm start` (systemd/pm2).
6. Nginx: тот же `server_name` / IP → proxy на `:3001`.

## 6. systemd (пример)

```ini
[Unit]
Description=AI Product Scene Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ai-product-scene-platform
Environment=NODE_ENV=production
EnvironmentFile=/var/www/ai-product-scene-platform/.env
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 7. Legacy `mvp3dcursor/`

Локальная справочная копия — в `.gitignore`, **не деплоится**. После миграции можно удалить или оформить архивом; код интегрирован в `apps/client` и `apps/server/src/infrastructure/`.
