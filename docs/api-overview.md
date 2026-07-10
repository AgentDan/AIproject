# API: monorepo vs mvp3dcursor



## Monorepo (Platform v2) — `apps/server`



| Метод | Путь | Назначение |

|-------|------|------------|

| GET | `/health` | healthcheck |

| GET | `/api` | список эндпоинтов |

| GET | `/api/storage/status` | локальное JSON-хранилище сессий |

| POST | `/api/commands` | AI pipeline (ClientRequest → ClientResponse) |

| GET | `/gltf/*` | статика GLTF из `apps/server/gltf/` |

| POST | `/api/auth/register` | регистрация (Mongo) |

| POST | `/api/auth/login` | вход (Mongo) |

| GET | `/api/models` | список 3D-моделей |

| GET | `/api/admin/users` | список пользователей (Mongo) |

| DELETE | `/api/admin/users/:id` | удаление пользователя |

| POST | `/api/admin/lab/from-s3` | Lab: temp файл из S3 |

| POST | `/api/admin/lab/save-to-s3` | Lab: сохранить в S3 |

| POST | `/api/admin/lab/close` | Lab: закрыть сессию |

| * | `/api/s3/*` | presigned / upload / stream R2 |



Без `MONGO_URI` auth/admin users → **503**. Без R2 env → **503** на `/api/s3` и lab from-s3/save. Без `JWT_SECRET` в production login → **503**.

**JWT:** `POST /api/auth/login` возвращает `{ user, token }`. Защищённые маршруты — заголовок `Authorization: Bearer <token>`.

| Защита | Маршруты |
|--------|----------|
| administrator | `GET/DELETE /api/admin/users`, `POST /api/admin/lab/from-s3`, `save-to-s3`, `GET /api/s3/objects`, `DELETE /api/s3/object/:key` |
| authenticated | `POST /api/s3/upload` |
| public | `POST /api/admin/lab/close`, `GET /api/s3/model/:key`, `GET /api/models`, `POST /api/commands` |



## GLTF



- **Dev:** `apps/server/gltf/` → URL `/gltf/имя.gltf` (пример: `Box.gltf`)

- **Prod / admin:** ключи в R2 (`BUCKET_NAME`), см. Panel Lab roadmap

