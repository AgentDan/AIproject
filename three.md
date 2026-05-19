# Дерево проекта `ai-product-scene-platform`

Снимок структуры репозитория: каталоги **без** `node_modules/`, `.git/`, артефактов сборки (`dist/`, `build/`).  
Локальные данные сервера в `apps/server/data/` могут содержать подпапки `sessions/`, `scenes/`, `action-history/`, `assets/`, `exports/` — их создаёт приложение при работе.

```text
.
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── three.md
│
├── docs/
│   ├── .keep.md
│   └── roadmap.md
│
├── apps/
│   ├── client/
│   │   ├── public/
│   │   │   └── .keep.md
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── styles.css
│   │   ├── .env.production.example
│   │   ├── .keep.md
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── mobile/
│   │   ├── .gitignore
│   │   ├── App.js
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   ├── eas.json
│   │   └── package.json
│   │
│   └── server/
│       ├── data/
│       │   └── .gitkeep
│       ├── gltf/
│       │   └── .gitkeep
│       ├── src/
│       │   ├── api/
│       │   │   └── .keep.md
│       │   ├── ai-services/
│       │   │   ├── .keep.md
│       │   │   ├── action-plan-generator.js
│       │   │   ├── action-plan-validator.js
│       │   │   ├── ai-fallback-retry-handler.js
│       │   │   ├── ai-response-parser.js
│       │   │   ├── intent-detector.js
│       │   │   ├── pipeline.js
│       │   │   ├── prompt-builder.js
│       │   │   └── scene-understanding-processor.js
│       │   ├── config/
│       │   │   ├── client-dist.js
│       │   │   ├── load-env.js
│       │   │   └── runtime.js
│       │   ├── core/
│       │   │   ├── .keep.md
│       │   │   ├── orchestrator.js
│       │   │   └── scene-context-builder.js
│       │   ├── handlers/
│       │   │   └── commands-handler.js
│       │   ├── lib/
│       │   │   └── send-json.js
│       │   ├── scene-modules/
│       │   │   ├── .keep.md
│       │   │   ├── gltf-glb-exporter.js
│       │   │   ├── material-engine.js
│       │   │   ├── mesh-analysis-engine.js
│       │   │   ├── pipeline.js
│       │   │   ├── product-rules-engine.js
│       │   │   ├── scene-diff-generator.js
│       │   │   ├── scene-graph-manager.js
│       │   │   ├── scene-validation-engine.js
│       │   │   └── transform-engine.js
│       │   ├── services/
│       │   │   └── help-service.js
│       │   ├── storage/
│       │   │   ├── .keep.md
│       │   │   └── local-storage.js
│       │   ├── validation/
│       │   │   └── .keep.md
│       │   ├── app.js
│       │   ├── index.js
│       │   └── server.js
│       └── package.json
│
└── packages/
    ├── .keep.md
    ├── ai/
    │   ├── src/
    │   │   ├── registry/
    │   │   │   └── IntentRegistry.ts
    │   │   └── index.ts
    │   ├── .gitignore
    │   ├── package.json
    │   └── tsconfig.json
    │
    └── contracts/
        ├── src/
        │   ├── .keep.md
        │   ├── action-plan.js
        │   ├── client-request.js
        │   ├── client-response.js
        │   ├── help-response.js
        │   ├── index.js
        │   ├── scene-context.js
        │   └── scene-result.js
        ├── .keep.md
        └── package.json
```

## Workspaces (корневой `package.json`)

| Путь | Назначение |
|------|------------|
| `apps/client` | Веб-клиент (Vite + React) |
| `apps/mobile` | Мобильное приложение (Expo) |
| `apps/server` | HTTP API (Express) |
| `packages/contracts` | Общие контракты (`@ai-product-scene-platform/contracts`) |
| `packages/ai` | Пакет AI (`@ai-product-scene-platform/ai`) |
