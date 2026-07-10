# Panel Lab и React Three Fiber

## Panel Lab (extras.panelLab в glTF)
- Настройки вьюера хранятся в `extras.panelLab` glTF JSON: camera, controls, lighting, ground, renderer, postprocessing, environment, annotations.
- Версия схемы: `panelLab.version === 1`.
- Камера: `camera.position`, `camera.fov`, `camera.near`, `camera.far`.
- Orbit controls: `controls.target`, `controls.minDistance`, `controls.maxDistance`.
- Освещение: directional/point/spot lights, shadows (`lighting.shadows.enabled`, mapSize, bias).
- Ground: `ground.enabled`, размер, цвет, shadow receive.
- Renderer: antialias, tone mapping, output color space, shadow map type.

## Команды освещения (MVP)
- «ярче», «brighter» — увеличить intensity directional или ambient.
- «темнее», «darker» — уменьшить intensity.
- «мягкие тени», «soft shadows» — PCFSoftShadowMap / VSMShadowMap в renderer.shadowMap.type.

## React Three Fiber
- Сцена configurator использует `@react-three/fiber` Canvas и `@react-three/drei` (Environment, OrbitControls, useGLTF).
- Модель клонируется при смене URL (`scene.clone(true)`) чтобы сбросить visibility/attachments.
- Варианты групп: имена mesh по convention `groupId_variantIndex_label`; видим только выбранный variant.

## AI ↔ сцена
- `clientState.domain` должен быть `configurator-3d` для workflow configurator.
- `clientState.modelKey` — ключ GLTF или S3.
- `clientState.objects` — список objectId для ActionPlan (root + группы `group-{id}`).
- Команды move/color применяются к target objectId из scene understanding.
