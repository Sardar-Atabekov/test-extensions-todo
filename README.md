# Next.js + Sequelize + PostgreSQL — TODO project (backend + Chrome extension frontend)

Что внутри

- backend (Next.js) с API: GET/POST /api/tasks, PUT/DELETE /api/tasks/:id
- models: Tasks, Categories (1..N)
- migrations (sequelize-cli)
- createCategories.js для быстрой инициализации категорий (или npm run seed:categories)
- эндпоинты категорий: GET/POST /api/categories, PUT/DELETE /api/categories/:id
- chrome extension (extension/) — чистый JS, popup.

ВАЖНО: я не могу поднять PostgreSQL и запустить сервер здесь. Проект готов к запуску локально.

Шаги запуска (локально)

1. Скопировать проект на машину с Node.js и PostgreSQL.
2. Установить зависимости:
   npm install
3. Создать базу данных PostgreSQL (например, todo_db) и пользователя, либо используйте существующие.
4. Создать файл .env на основе .env.example и заполнить параметры.
5. Прогнать миграции:
   npm run migrate
6. Инициализировать категории:
   npm run seed:categories
7. Запустить dev сервер Next.js:
   npm run dev
   (сервер будет по умолчанию на http://localhost:3000)

Тестирование API (пример):

- GET /api/tasks
- POST /api/tasks { title, categoryId }
- PUT /api/tasks/:id { completed }
- DELETE /api/tasks/:id

Установка расширения в Chrome (для разработки)

1. Открой chrome://extensions/
2. Включить режим разработчика.
3. Нажать "Загрузить распакованное расширение" и выбрать папку project/extension
4. Открой popup (клик по иконке) — он будет делать запросы к http://localhost:3000/api/tasks

Если будут ошибки — пришли вывод консоли (npm run dev) и ошибки из браузера. Я помогу быстро найти и исправить.
