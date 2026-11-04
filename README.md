# Mini CRM

## Запуск приложения

```bash
npm run dev
```

## Сборка приложения

```bash
npm run build
```

## Базовые данные

### Пользователи

| Email              | Password    | Роль     |
| ------------------ | ----------- | -------- |
| manager@test.com   | password123 | manager  |
| executor1@test.com | password123 | executor |
| executor2@test.com | password123 | executor |

### Объекты

| Объект         | Адрес               |
| -------------- | ------------------- |
| «ЖК Солнечный» | СПб, ул. Ленина, 15 |
| «БЦ Речной»    | СПб, наб. Волги, 3  |
| «Склад №4»     | СПб, промзона «Юг»  |

### Задачи

| №   | Title               | object_id    | assignee_id | author_id | status      |
| --- | ------------------- | ------------ | ----------- | --------- | ----------- |
| 1   | Заказать бетон М300 | ЖК Солнечный | executor1   | manager   | new         |
| 2   | Проверить фундамент | ЖК Солнечный | executor1   | manager   | in_progress |
| 3   | Согласовать смету   | БЦ Речной    | executor2   | manager   | review      |
| 4   | Отчёт по материалам | БЦ Речной    | executor2   | manager   | done        |
| 5   | Переделать чертёж   | Склад №4     | executor1   | manager   | rework      |
