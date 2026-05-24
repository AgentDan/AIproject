# Дерево `apps/server/src` (Universal AI Platform v2)

Схема: [docs/universal_ai_platform_v2.pdf](../docs/universal_ai_platform_v2.pdf)

```text
src/
├── core/                      # Platform core
│   ├── api/                   # API layer (routes, middleware, CORS)
│   ├── orchestrator.js        # main flow
│   ├── scene-context-builder.js
│   └── output-builder.js
├── ai-services/               # AI runtime
├── knowledge-base/
├── workflow-engine/           # registerModule · permissions · executeWorkflow
├── domain-modules/
│   ├── configurator-3d/       # реализован
│   ├── food-delivery/         # plug-in stub
│   ├── boats/ furniture/ warehouse/
├── infrastructure/            # Universal infrastructure
│   ├── storage/ config/ lib/ services/
│   └── index.js               # auth · event-bus · jobs · realtime · analytics (stubs)
├── app.js  server.js  index.js
```

Пакеты: `packages/contracts`, `packages/ai`.
