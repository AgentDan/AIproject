# Дерево проекта `ai-product-scene-platform`
const helloWorld="false";
Снимок **без** `node_modules/`, `.git/`, `dist/`, `build/`.  
Подробная архитектура: [docs/architecture.md](docs/architecture.md).

Локально создаются: `apps/server/data/{sessions,scenes,...}`; индекс RAG: `apps/server/src/knowledge-base/data/index/` (см. `.gitignore`).

```text
.
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── three.md
│
├── docs/
│   ├── architecture.md
│   ├── roadmap.md
│   └── .keep.md
│
├── apps/
│   ├── client/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── api/client.js
│   │   │   ├── components/
│   │   │   │   ├── CommandInput.jsx
│   │   │   │   ├── Preview3D.jsx
│   │   │   │   └── ResultViewer.jsx
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── styles.css
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   ├── mobile/ …
│   └── server/
│       ├── data/  gltf/
│       ├── src/core/api/ (middleware.js, routes.js)
│       ├── src/knowledge-base/ …
│       ├── src/ai-services/ …
│       ├── src/scene-modules/ …
│       ├── src/storage/, config/, services/, lib/
│       └── app.js, server.js, index.js
│
└── packages/contracts, packages/ai …
```
