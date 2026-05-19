# AIproject — архитектура и файловая структура

> **Принцип:** блок на схеме архитектуры соответствует папке в коде. PDF-схему (`full_project_architecture_with_rag.pdf`) можно положить в этот каталог как справочный артефакт.

## Соответствие: блок → папка

| Блок на схеме | Папка в проекте |
|---------------|-----------------|
| **User** | внешний |
| **Client Side** | `apps/client/`, `apps/mobile/` |
| **Platform Core** | `apps/server/src/core/` |
| API Layer | `apps/server/src/core/api/` (`routes.js`, `middleware.js`) |
| Orchestrator | `core/orchestrator.js` |
| Context Builder | `core/scene-context-builder.js` |
| Output Builder | `core/output-builder.js` |
| **AI Services** | `apps/server/src/ai-services/` |
| Intent Detector | `intent-detector.js` |
| RAG Retriever | `rag-retriever.js` |
| Prompt Builder | `prompt-builder.js` (принимает `chunks`) |
| Plan Generator + Validator | `action-plan-generator.js`, `action-plan-validator.js` |
| **Knowledge Base** | `apps/server/src/knowledge-base/` |
| **Scene Modules** | `apps/server/src/scene-modules/` |
| Локальное хранилище | `apps/server/src/storage/`, `apps/server/data/` |

## Поток данных

1. User → команда  
2. Client → `POST /api/commands` (`ClientRequest`)  
3. **API Layer** (`core/api/routes.js`) → валидация контракта  
4. **Orchestrator** → ранние ответы (например help)  
5. **Context Builder** → `SceneContext`  
6. **AI Services:** Intent → **RAG** → Prompt → Plan → Validate  
7. **Scene Modules** → детерминированное исполнение плана  
8. **Output Builder** → `ClientResponse`  
9. Client → превью / UI  

Псевдокод пайплайна AI:

```js
const intent = detectIntent(command);
const chunks = await ragRetriever.retrieve(command, { topK: 5 });
const prompt = promptBuilder.build({ sceneContext, intent, chunks });
const plan = await planGenerator.generate(prompt); // MVP: rule-based
const valid = planValidator.validate(plan, sceneCtx);
```

## Принципы

1. Один логический блок схемы → одна зона каталогов.  
2. **AI Services** не мутируют сцену — только `ActionPlan`.  
3. **Scene Modules** без LLM — только детерминированная логика.  
4. Общие структуры данных — в `packages/contracts`.  
5. **Knowledge Base** изолирована; AI обращается через `rag-retriever.js`.  

## Чек-лист RAG (реализовано в репозитории)

1. `packages/contracts/src/retrieved-chunk.js` + экспорт из `index.js`.  
2. `knowledge-base/` — `vector-store.js`, `embeddings.js`, `chunker.js`, `loader.js`, `indexer.js`, `data/source/`, `data/index/`.  
3. `npm run kb:index` — построение индекса.  
4. `ai-services/rag-retriever.js` — retrieval для промпта.  
5. `prompt-builder.js` — секция «Relevant knowledge».  
6. `pipeline.js` — порядок: intent → retrieve → prompt → …  
7. Переменные `.env` — см. корневой `.env.example`.  

---

Полное целевое дерево файлов см. в [three.md](../three.md) в корне репозитория.
