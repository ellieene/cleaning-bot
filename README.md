# Деньги Артема

Приложение для учёта выплат с Telegram Mini App.

## Структура

```
Money/
├── frontend/          # Одностраничный сайт
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── config.js   ← настройки (URL сервера)
│   │   ├── api.js      ← запросы к API
│   │   ├── telegram.js ← Telegram WebApp
│   │   ├── main.js     ← главное меню
│   │   └── hidden.js   ← скрытое меню
│   └── assets/logo.svg
│
└── backend/           # Сервер и база данных
    ├── start.sh       ← запуск одной командой (Ubuntu)
    ├── server.py
    ├── organizations.json  ← список организаций
    └── data/          ← SQLite база (создаётся автоматически)
```

## Быстрый старт (Ubuntu)

### 1. Сервер (база данных)

```bash
cd backend
chmod +x start.sh
bash start.sh
```

> **Важно:** запускайте через `bash start.sh` или `./start.sh`, а не `sh start.sh` — на Ubuntu `sh` это dash, и скрипт не сработает.

При первом запуске создаётся `.env` — укажите в нём токен Telegram-бота:

```
TELEGRAM_BOT_TOKEN=ваш_токен
HOST=0.0.0.0
PORT=5000
```

Откройте порт в файрволе:

```bash
ufw allow 5000
```

### 2. Фронтенд

Разместите папку `frontend` на веб-сервере (nginx, Apache).

В `frontend/js/config.js` укажите URL вашего сервера:

```js
API_URL: 'http://161.104.17.204:5000',
```

### 3. Telegram Mini App

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. В BotFather: `/newapp` → привяжите URL вашего `index.html`
3. Токен бота храните только в `backend/.env` (не в коде сайта!)

## Использование

**Главное меню:** выбор организации, сумма, дата → «Записать»

**Скрытое меню:** 1 нажатие на логотип → скачивание, добавление и удаление

## Редактирование организаций

Откройте `backend/organizations.json` и измените список:

```json
[
  "ООО Альфа",
  "ИП Бета"
]
```

Перезапуск сервера не требуется.
