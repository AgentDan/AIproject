# Команды Configurator-3D

## Перемещение
- «move left», «сдвинь влево» — translation.x отрицательный.
- «move right», «вправо» — translation.x положительный.
- «up», «вверх» — translation.y положительный.
- «down», «вниз» — translation.y отрицательный.
- «forward», «назад» — translation.z.

## Цвет и материал
- «red», «красный», «make it red» — CHANGE_OBJECT_COLOR с color red.
- Доступные цвета MVP: red, blue, green, black, white, yellow, cyan, purple.

## Выбор цели
- Если в команде есть имя группы (label из glTF node naming), target — объект `group-{id}`.
- Иначе target — первый movable объект или `configurator-root`.

## Измерения и debug
- «bounding box», «show bounds» — SHOW_BOUNDING_BOXES.
- «measure distance» — MEASURE_MESH_DISTANCE.

## Panel Lab в admin mode
- `labKey` в URL configurator — редактирование модели из S3 с сохранением extras.panelLab через `/api/admin/lab/save-to-s3`.
