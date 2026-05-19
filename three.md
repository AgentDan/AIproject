# Дерево проекта (ориентир по [Universal AI Platform v2](docs/universal_ai_platform_v2.pdf))

Снимок **без** `node_modules/`, `.git/`, `dist/`, `build/`. Подробности слоёв: [docs/architecture.md](docs/architecture.md).

```text
apps/server/src/
├── core/                    # Platform core (api, orchestrator, builders)
├── ai-services/            # AI runtime
├── knowledge-base/
├── workflow-engine/        # ActionPlan → domain module (executeWorkflow)
├── domain-modules/
│   └── configurator-3d/    # плагин 3D (бывший scene-modules)
├── storage/  config/  services/  lib/
├── app.js  server.js  index.js
```

**Поток:** AI runtime → `ActionPlan` → **`workflow-engine`** → **`domain-modules/<plugin>`** → Output builder → клиент.
