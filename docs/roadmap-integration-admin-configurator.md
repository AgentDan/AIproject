# Roadmap: интеграция админки и 3D Configurator из `mvp3dcursor`

Источник: локальная копия [mvp3dcursor](../mvp3dcursor/) (оригинал — [github.com/AgentDan/mvp3dcursor](https://github.com/AgentDan/mvp3dcursor)).

Целевой проект: monorepo **AI Product Scene Platform** (`apps/client`, `apps/server`, `packages/*`) по схеме **Universal AI Platform v2**.

---

## 1. Что есть в двух проектах

### `mvp3dcursor` (legacy MVP)

| Область | Содержимое |
|---------|------------|
| **Клиент** | React + Vite + React Router + **@react-three/fiber** |
| **3D Configurator** | `client/src/features/configurator/` — сцена, варианты, **Panel Lab** (свет, камера, ground, post), загрузка GLTF |
| **Админка** | `client/src/features/admin/` — dashboard, регистрация, **ModelsAdmin**, Lab temp (S3) |
| **Auth** | login/register, JWT, MongoDB (`features/auth`) |
| **Сервер** | Express 5, CommonJS: `/api/auth`, `/api/admin`, `/api/models`, `/api/s3` |
| **Хранилище** | MongoDB, Cloudflare R2 (S3 API), локальная папка `gltf/` |
| **Shared** | `shared/panelLabSchema.mjs` — схема настроек вьюера в `extras.panelLab` glTF |

### Текущий monorepo (`05_Cursor`)

| Область | Содержимое |
|---------|------------|
| **Клиент** | MVP shell + widgets, **упрощённый 2D-preview**, голос/текст → `POST /api/commands` |
| **Сервер** | Platform core, AI runtime, RAG, workflow-engine, **`domain-modules/configurator-3d`** (серверное исполнение ActionPlan, без R3F) |
| **Auth / Admin / S3** | заглушки в `infrastructure/index.js`, **не реализованы** |
| **3D на клиенте** | нет полноценного three.js configurator |

**Вывод:** `mvp3dcursor` даёт **готовый UI (админка + 3D) и backend auth/models/S3**; monorepo даёт **архитектуру платформы и AI-команды**. Интеграция = перенести фичи в слои v2, не ломая orchestrator и domain-modules.

---

## 2. Целевая карта (куда что ложится)

```text
apps/client/
  shell/              ← MainLayout, роутинг (из mvp3dcursor layout)
  features/
    auth/             ← LoginPage, RegisterPage, authStore
    admin/            ← AdminLayout, Dashboard, ModelsAdmin, AdminRegister
    configurator/     ← Configurator3D, Panel Lab, hooks, store
  widgets/            ← CommandInput, ResultViewer (AI shell — как сейчас)

apps/server/src/
  infrastructure/
    auth/             ← users, JWT (из mvp3dcursor features/auth)
    storage/          ← local JSON (сессии) + опционально Mongo для users
    cloud-r2/         ← S3/R2 (из cloudR2)
  core/api/routes.js  ← монтировать /api/auth, /api/admin, /api/models, /api/s3
  domain-modules/
    configurator-3d/  ← серверный pipeline + позже синхронизация с panelLab

packages/
  panel-lab-schema/   ← panelLabSchema.mjs (из shared/)
  contracts/          ← ClientRequest, ActionPlan, SceneResult (+ panelLab refs)
```

---

## 3. Roadmap по фазам

### Фаза 0 — Подготовка (1–2 дня)

- [x] Зафиксировать `.env.example`: MongoDB, R2/S3, JWT_SECRET, PORT (сверить с `mvp3dcursor/.env` и `client/.env`)
- [x] Вынести `mvp3dcursor/shared/panelLabSchema.mjs` → `packages/panel-lab-schema/`
- [x] Согласовать путь GLTF: `apps/server/gltf/` + прокси `/gltf` (см. `docs/api-overview.md`)
- [x] Добавить в `.gitignore` корня: `mvp3dcursor/`
- [x] Документировать diff API: `docs/api-overview.md`

**Критерий готовности:** один `npm run dev` поднимает monorepo; список env-переменных для parity с mvp3dcursor.

---

### Фаза 1 — Сервер: Auth + Admin API (3–5 дней)

Перенос из `mvp3dcursor/src/features/` в `apps/server/src/infrastructure/` (ES modules).

| Legacy | Целевой путь |
|--------|----------------|
| `features/auth/*` | `infrastructure/auth/` (routes, service, user model) |
| `features/admin/routes.js` + `labController.js` | `infrastructure/admin/` |
| `features/models/*` | `infrastructure/models/` |
| `features/cloudR2/*` | `infrastructure/cloud-r2/` |
| `services/db.js`, `labTemp.js` | `infrastructure/db/`, `infrastructure/admin/lab-temp.js` |

Задачи:

- [x] Портировать Mongoose-модель пользователя и `/api/auth` (register, login) — без MONGO_URI → 503
- [x] Портировать `/api/admin/users`, `/api/admin/lab/*` (from-s3, save-to-s3, close)
- [x] Портировать `/api/models` (список; без Mongo — fallback `apps/server/gltf/`)
- [x] Портировать `/api/s3` (presigned / upload / stream)
- [x] Подключить маршруты в `core/api/routes.js`
- [x] Middleware **auth · rate limit** в `core/api/middleware.js` (по схеме v2)

**Критерий готовности:** Postman/curl — login, list models, admin lab open/close; Mongo + R2 из monorepo.

---

### Фаза 2 — Клиент: 3D Configurator (5–7 дней)

Перенос `mvp3dcursor/client/src/features/configurator/` → `apps/client/src/features/configurator/`.

- [x] Зависимости: `three`, `@react-three/fiber`, `@react-three/drei`, `zustand` (версии из mvp3dcursor `client/package.json`)
- [x] Перенести `ConfiguratorPage`, `Configurator3D`, `ConfiguratorScene`, Panel Lab (`panelLab/*`)
- [x] Перенести `shared/scene/` (viewerSettingsStore, panelLabThree)
- [x] Алиас `@repo/panelLabSchema` → `packages/panel-lab-schema`
- [x] Роутинг: `react-router-dom`, маршрут `/configurator?modelKey=...`
- [x] API base URL — Vite proxy `/api` и `/gltf` → `:3001`
- [ ] Статика: HDR/video из `client/public/` → `apps/client/public/` (если нужны HDRI из legacy)

**Критерий готовности:** открытие `/configurator` с моделью из `/gltf` или R2; Panel Lab сохраняет в glTF extras (локально или S3).

---

### Фаза 3 — Клиент: Админка (3–4 дня)

Перенос `mvp3dcursor/client/src/features/admin/` + `features/models/ModelsAdmin.jsx`.

- [x] Маршруты `/admin`, `/admin/register`, `/admin/models`
- [x] `AdminLayout`, dashboard, управление пользователями
- [x] Интеграция Lab: открытие модели из S3 → `/configurator?labKey=...`
- [x] Защита маршрутов: redirect на `/login` без JWT (authStore)
- [x] Общий `MainLayout` / header (из `layout/MainLayout.jsx`)

**Критерий готовности:** админ видит users, models; может открыть Lab и сохранить в S3.

---

### Фаза 4 — Auth UI + shell (2–3 дня)

- [x] Перенести `features/auth/` (LoginPage, RegisterPage, forms, authStore + JWT token)
- [x] Home page (опционально) из `features/home/`
- [x] Единый `App.jsx`: Routes для `/`, `/configurator`, `/login`, `/admin`, AI shell
- [x] Согласовать UX: AI-команды vs ручной configurator (две вкладки или один экран)

**Критерий готовности:** регистрация/логин работают против monorepo API.

---

### Фаза 5 — Связка AI ↔ Configurator-3D (5+ дней)

Серверный `domain-modules/configurator-3d` сегодня — rule-based ActionPlan без R3F. Нужен мост:

- [x] Расширить `SceneContext` контракт: `modelKey`, `panelLab` snapshot, selected objects
- [x] Context builder: подтягивать metadata модели из storage / Mongo / glTF extras
- [x] AI команды («move left», «red material») → ActionPlan → workflow → **ответ с `previewUpdate`**, который клиент применяет в R3F-сцене (замена 2D Preview3D)
- [x] Опционально: RAG-документы в `knowledge-base/data/source/` — правила Panel Lab и three.js
- [x] `clientState.domain: 'configurator-3d'` + `modelKey` в POST `/api/commands`

**Критерий готовности:** голосовая команда меняет объект в полноценной 3D-сцене configurator.

---

### Фаза 6 — Production и деплой (2–3 дня)

- [x] `npm run build` → `apps/client/dist`, сервер отдаёт SPA (уже в `core/api/routes.js`)
- [x] Env на сервере: `NODE_ENV=production`, Mongo, R2, `CORS_ORIGIN` — см. [deploy-production.md](deploy-production.md)
- [x] Единый процесс: `npm start` → `apps/server`
- [x] Миграция с `89.168.87.13`: один каталог деплоя, nginx reverse proxy — [deploy-production.md](deploy-production.md)
- [x] `mvp3dcursor/` — локальный reference в `.gitignore`, не деплоится

**Критерий готовности:** prod на том же IP, что и раньше, с monorepo-сборкой.

---

## 4. Риски и решения

| Риск | Митигация |
|------|-----------|
| CommonJS (legacy) vs ESM (monorepo) | Портировать модули по одному; не подключать `require()` в server |
| Два источника GLTF (disk vs R2) | Единый `models` service: key → URL; локальный fallback для dev |
| Дублирование CORS | Только `cors` в `core/api/middleware.js` |
| Nested git в `mvp3dcursor/` | Submodule или удалить `.git` после переноса |
| Panel Lab schema drift | Один пакет `packages/panel-lab-schema`, версия в glTF `extras.panelLab.version` |

---

## 5. Приоритет (рекомендуемый порядок)

1. **Фаза 0 + 1** — backend auth/admin/models/S3 (без UI можно тестировать API).
2. **Фаза 2** — 3D configurator на клиенте (главная ценность продукта).
3. **Фаза 3 + 4** — админка и auth UI.
4. **Фаза 5** — AI + 3D (уникальность monorepo).
5. **Фаза 6** — деплой.

---

## 6. Ссылки внутри репозитория

| Документ / код | Путь |
|----------------|------|
| Legacy configurator | `mvp3dcursor/client/src/features/configurator/` |
| Legacy admin | `mvp3dcursor/client/src/features/admin/` |
| Panel Lab docs | `mvp3dcursor/docs/configurator/Panel-Lab.md` |
| Server domain 3D | `apps/server/src/domain-modules/configurator-3d/` |
| Platform architecture | `three.md`, `docs/universal_ai_platform_v2.pdf` |
| AI entrypoint | `apps/client/src/shell/AppShell.jsx` → `POST /api/commands` |

---

*Обновлено при появлении локальной копии `mvp3dcursor/` в корне monorepo.*
