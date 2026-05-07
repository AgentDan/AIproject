# AI Product Scene Platform

We are building an AI-driven platform for working with 3D and product scenes through voice or text commands.

## Architecture

**Architecture name:** Modular AI-Orchestrated Pipeline Architecture

## Core Flow

```text
End User
-> Client Side
-> Client Request
-> Platform Core
-> Scene Context
-> AI Services
-> Action Plan
-> Scene Modules
-> Scene Result
-> Output / Result
-> Client Response
-> Client Side
```

## Main Modules

### Client Side

- Voice / Text Command
- 3D Preview
- Result Viewer
- Scene Controls

### Platform Core

- API Layer
- Platform Orchestrator
- Scene Context Builder
- Storage Service
- Output Builder
- Validation / Error Handler

### AI Services

- Prompt Builder
- Intent Detector
- Scene Understanding Processor
- Action Plan Generator
- Action Plan Validator
- AI Response Parser
- AI Fallback / Retry Handler

### Scene Modules

- Scene Graph Manager
- Transform Engine
- Material Engine
- Mesh Analysis Engine
- Product Rules Engine
- Scene Validation Engine
- Scene Diff Generator
- GLTF / GLB Exporter

### Data / Storage

- S3 for GLB, GLTF, assets, and exports
- Database for scene metadata, sessions, product catalog, action history, and scene diffs

## Core Data Contracts

- Client Request
- Scene Context
- Action Plan
- Scene Result
- Client Response

## MVP Use Cases

1. Move Object
2. Show Bounding Boxes
3. Measure Mesh Distance
4. Change Object Color
5. Download Updated Scene

## MVP Features

- Upload or load a GLB or GLTF scene
- View the scene in the 3D Preview
- Send a voice or text command
- Build the Scene Context
- Detect intent
- Generate an Action Plan
- Execute scene actions
- Show bounding boxes
- Measure mesh distance
- Move an object
- Change an object's color
- Save the updated scene
- Download the updated scene
- Show the scene diff and explanation

## Suggested Project Structure

Monorepo with:

- `apps/web`
- `apps/server`
- `packages/contracts`
- `docs`

## Important Implementation Note

AI Services do not directly change the scene.
AI Services generate an Action Plan.
Scene Modules execute the Action Plan and validate the result.

## Communication Preference

Whenever the user writes in English, correct the English first before answering.
