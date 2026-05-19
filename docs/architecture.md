# Архитектура: Universal AI Platform v2

Официальная схема: **[universal_ai_platform_v2.pdf](universal_ai_platform_v2.pdf)** (копия рядом с этим файлом).

Ниже — содержание схемы в виде слоёв и соответствие каталогам в этом репозитории. Там, где в коде ещё нет отдельной папки, это отмечено как **дорожная карта**. Домен **Configurator-3D** реализован в `apps/server/src/domain-modules/configurator-3d/`.

---

## Слой «Пользователь»

| На схеме | Смысл |
|----------|--------|
| Пользователь | voice · text · action |

---

## Client layer

| На схеме | Роль | В проекте |
|----------|------|-----------|
| **apps/client · apps/mobile** | оболочка UI | `apps/client/`, `apps/mobile/` |
| UI shell · Auth · Chat | вход, чат, экраны | частично: MVP UI без отдельного модуля Auth/Chat (**дорожная карта**) |
| навигация · профиль | маршрутизация, профиль | **дорожная карта** |
| Realtime · Notifications | WebSocket · push | **дорожная карта** |
| Domain UI widgets | 3D view · forms · maps | частично: превью в `apps/client/src/components/Preview3D.jsx` |

**Ответ клиенту** приходит как `ClientResponse` после Output Builder.

---

## Platform core

Единый каркас платформы: склейка этапов и HTTP, без доменной логики конкретной отрасли.

| Блок на схеме | Назначение | Папка / файлы |
|---------------|------------|----------------|
| **API layer** | auth · rate limit · маршруты · CORS · JSON | `apps/server/src/core/api/` — `routes.js`, `middleware.js` (auth/rate limit — **дорожная карта**) |
| **Orchestrator** | главный flow | `core/orchestrator.js` |
| **Context builder** | сборка `SceneContext` | `core/scene-context-builder.js` |
| **Output builder** | результат сцены → `ClientResponse` | `core/output-builder.js` |

---

## AI runtime

**Универсальный** для всех доменов.

| Блок | Назначение | В проекте |
|------|------------|-----------|
| Intent detector | определение намерения | `ai-services/intent-detector.js` |
| RAG retriever | top-K чанков из KB | `ai-services/rag-retriever.js` |
| Prompt builder | context + intent + chunks | `ai-services/prompt-builder.js` |
| Plan generator | LLM → `ActionPlan` (MVP: rule-based) | `ai-services/action-plan-generator.js` |
| Plan validator | схема · правила · лимиты | `ai-services/action-plan-validator.js` |
| Вспомогательные стадии | парсинг, fallback, scene understanding | остальные `ai-services/*.js` |

**На выходе:** **`ActionPlan`** — запрос к workflow / домену.

---

## Knowledge base

| Блок | В проекте |
|------|-----------|
| Vector store · cosine · top-K | `knowledge-base/vector-store.js` |
| Embeddings (OpenAI · Voyage · local / stub) | `knowledge-base/embeddings.js` |
| Chunker · loader (md · txt · json) | `chunker.js`, `loader.js` |
| Индекс | `indexer.js`, `data/source/`, `data/index/` |

---

## Workflow engine

На схеме: **ActionPlan → domain module**; **module loader** (`registerModule()`); **permissions** (roles · ACL по модулям); цепочка **intent → route → execute workflow** в нужном **domain module**.

| Концепция v2 | В этом репозитории сейчас |
|----------------|---------------------------|
| Единый workflow-движок | `apps/server/src/workflow-engine/` — `executeWorkflow()` направляет `ActionPlan` в зарегистрированный домен (MVP: `configurator-3d`). |
| Module loader (`registerModule`) | Частично: новые домены — ветка в `execute-workflow.js` и реализация в `domain-modules/<id>/`. Реестр плагинов без правок файла — **дорожная карта**. |
| Permissions per module | **дорожная карта**. |

---

## Domain modules (plug-ins)

На схеме: **`domain-modules/`** — подключать и менять плагины **без правок core**. Примеры: **Configurator-3D**, Food delivery, Boats, Furniture, Warehouse, CRM/ERP — у каждого свои workflow; 3D-конфигуратор может переиспользоваться как плагин.

| Домен на схеме | В этом репозитории |
|----------------|---------------------|
| **Configurator-3D** (Scene graph · Transform · Material · GLTF export) | **`apps/server/src/domain-modules/configurator-3d/`** — `executeConfigurator3dPipeline` в `pipeline.js`. |
| Остальные домены | не реализованы: новая папка под `domain-modules/` + ветка в `workflow-engine/execute-workflow.js`. |

Клиент может указать домен в `clientState.domain` (константы — `DOMAIN_IDS` в workflow engine). Неизвестный идентификатор возвращает ошибку с перечислением доступных модулей.

---

## Universal infrastructure

На схеме: Auth · Storage · Event bus · Jobs · Realtime · **Contracts** · Analytics.

| Компонент | В проекте |
|-----------|-----------|
| Contracts | `packages/contracts/` |
| AI registry (интенты) | `packages/ai/` |
| Storage (runtime) | `apps/server/src/storage/`, `apps/server/data/` |
| Auth, Event bus, Jobs, Realtime, Analytics | **дорожная карта** |

---

## Legend (как в PDF)

- **Platform core** — каркас HTTP и склейка этапов.
- **AI runtime** — понимание и план без исполнения в домене.
- **Knowledge base** — RAG.
- **Domain module** — детерминированное исполнение и доменные правила.
- **Infra / generic** — общие пакеты и сервисы.

**Поток данных:** пользователь → Client layer → Core API → Orchestrator → Context → **AI runtime** (при необходимости **chunks** из KB) → **ActionPlan** → **workflow / domain module** → **Output builder** → **ClientResponse** → клиент.

---

## Быстрые отсылки

- Дерево каталогов: [three.md](../three.md)
- Запуск и RAG: [README.md](../README.md)
