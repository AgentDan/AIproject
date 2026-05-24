# Архитектура: Universal AI Platform v2

Официальная схема: **[universal_ai_platform_v2.pdf](universal_ai_platform_v2.pdf)**.

Структура кода приведена к блокам схемы: один блок → одна зона каталогов (где реализовано или заглушка).

---

## Client layer → `apps/client/`, `apps/mobile/`

| На схеме | В проекте |
|----------|-----------|
| UI shell | `apps/client/src/shell/AppShell.jsx` |
| Domain UI widgets (3D, forms…) | `apps/client/src/widgets/` |
| API client | `apps/client/src/api/client.js` |
| Auth · Chat · Realtime · push | **дорожная карта** (см. `apps/client/src/README.md`) |

---

## Platform core → `apps/server/src/core/`

| Блок | Файлы |
|------|--------|
| **API layer** | `core/api/routes.js`, `middleware.js` — только HTTP; flow не здесь |
| **Orchestrator** | `core/orchestrator.js` — `orchestrateCommand()` |
| **Context builder** | `core/scene-context-builder.js` |
| **Output builder** | `core/output-builder.js` |

---

## AI runtime → `apps/server/src/ai-services/`

Intent → RAG → Prompt → Plan generator → Plan validator (`pipeline.js` склеивает стадии).

---

## Knowledge base → `apps/server/src/knowledge-base/`

Vector store, embeddings, chunker, loader, indexer, `data/source/`, `data/index/`.

---

## Workflow engine → `apps/server/src/workflow-engine/`

| На схеме | Файл |
|----------|------|
| Module loader · `registerModule()` | `module-registry.js`, `bootstrap.js` |
| Permissions (ACL per module) | `permissions.js` |
| ActionPlan → domain module | `execute-workflow.js` |

---

## Domain modules → `apps/server/src/domain-modules/`

| Плагин | Статус |
|--------|--------|
| `configurator-3d/` | реализован (Scene graph, Transform, Material, GLTF…) |
| `food-delivery/`, `boats/`, `furniture/`, `warehouse/` | README-заглушки, регистрация через `registerModule` при реализации |

---

## Universal infrastructure → `apps/server/src/infrastructure/`

| На схеме | В проекте |
|----------|-----------|
| Storage | `infrastructure/storage/` |
| Config / env | `infrastructure/config/` |
| Shared helpers | `infrastructure/lib/`, `infrastructure/services/` |
| Auth · Event bus · Jobs · Realtime · Analytics | заглушки в `infrastructure/index.js` |
| Contracts · AI registry | `packages/contracts`, `packages/ai` |

---

## Поток данных

User → Client → **API layer** → **Orchestrator** → Context → **AI runtime** (+ KB chunks) → **ActionPlan** → **Workflow engine** → **domain module** → **Output builder** → **ClientResponse**.

---

[three.md](../three.md) · [README.md](../README.md)
