# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start both server and client concurrently
npm run dev

# Start individually
npm run dev:server   # Node.js server on port 3001
npm run dev:client   # Vite React client on port 5173
npm run dev:mobile   # Expo mobile app
```

### Build & Production
```bash
npm run build                          # Build client only
npm run start --workspace apps/server  # Run server without nodemon
```

### Mobile (Expo / EAS)
```bash
npm run dev:mobile                     # Start Expo dev server
npm run build:android:apk --workspace apps/mobile   # Preview APK
npm run build:android:aab --workspace apps/mobile   # Production AAB
```

## Architecture

**Monorepo** with npm workspaces: `apps/client`, `apps/server`, `apps/mobile`, `packages/contracts`.

### Core Request Pipeline

The platform processes user voice/text commands through a two-phase pipeline:

```
Client → POST /api/commands → Scene Context Builder
  → AI Services Pipeline (intent → action plan)
  → Scene Modules Pipeline (execute → validate → diff)
  → Client Response
```

**Critical architectural rule:** AI services never mutate the scene directly. They produce an `ActionPlan`; scene modules execute it.

### Data Contracts (`packages/contracts`)

Shared JS data contracts define the boundaries between every pipeline stage. All inter-module communication uses these typed structures:

| Contract | Purpose |
|---|---|
| `ClientRequest` | Client → server (command, inputType, sessionId, sceneData) |
| `SceneContext` | Built by server from scene state; input to AI services |
| `ActionPlan` | AI output — ordered steps with type, target, parameters |
| `SceneResult` | Execution outcome — status, diff, measurements, validation |
| `ClientResponse` | Server → client (result, explanation, preview, sceneData) |

### AI Services (`apps/server/src/ai-services/`)

Orchestrated by `pipeline.js`. Stages run in sequence:

`PromptBuilder → IntentDetector → SceneUnderstandingProcessor → ActionPlanGenerator → ActionPlanValidator → AIResponseParser → AIFallbackRetryHandler`

Currently **rule-based / deterministic** (no LLM integration yet). Supported intents: `move_object`, `change_object_color`, `show_bounding_boxes`, `measure_mesh_distance`, `download_updated_scene`.

### Scene Modules (`apps/server/src/scene-modules/`)

Orchestrated by `pipeline.js`. Takes an `ActionPlan` and executes against the scene graph:

`SceneGraphManager → TransformEngine / MaterialEngine / MeshAnalysisEngine → ProductRulesEngine → SceneValidationEngine → SceneDiffGenerator → GLTFExporter`

### Server (`apps/server/src/index.js`)

Vanilla Node.js HTTP server (no framework). Routes:
- `GET /health` — health check
- `GET /api` — API metadata
- `GET /api/storage/status` — storage status
- `POST /api/commands` — main command endpoint

### Client (`apps/client/src/App.jsx`)

Single-page React app (Vite + Tailwind v4). Fullscreen 3D preview with a floating voice/text input control. Uses the Web Speech API for voice recognition with text input fallback. Responses auto-dismiss after ~5 seconds.

### Storage (`apps/server/src/storage/`)

Local JSON file storage at `apps/server/data/` (git-ignored). Subdirectories: `sessions/`, `scenes/`, `action-history/`, `assets/`, `exports/`. Override root with `SERVER_STORAGE_DIR` env var.

## Environment Variables

| Variable | Default | Where |
|---|---|---|
| `PORT` | `3001` | server |
| `SERVER_STORAGE_DIR` | `apps/server/data` | server |
| `VITE_API_URL` | `http://localhost:3001` | client |

## Current MVP State

- End-to-end request/response loop is operational
- AI pipeline is rule-based (OpenAI/LLM integration is a future step)
- Scene data is preview/stub only — no real GLB/GLTF parsing yet
- Storage is local JSON files — S3 and DB are future steps
- No automated tests exist yet
