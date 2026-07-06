# Деньги Артема

Приложение для учёта выплат с Telegram Mini App.

## Архитектура

| Часть | Адрес |
|-------|-------|
| **Фронтенд** | https://ellieene.github.io/cleaning-bot/ |
| **Backend API** | https://161-104-17-204.nip.io/api/ |
| **Сервер** | 161.104.17.204 |

## Запуск backend на сервере

```bash
cd ~/cleaning-bot
git pull
bash install.sh
```

### Токен Telegram-бота

```bash
nano backend/.env
systemctl restart money-backend
```

## Проверка

```bash
curl https://161-104-17-204.nip.io/api/health
```

## Структура

```
cleaning-bot/
├── index.html         ← GitHub Pages
├── frontend/          ← css, js, assets
├── backend/           ← API + SQLite
├── install.sh         ← установка на сервер
└── deploy/            ← nginx + systemd
```

## Полезные команды

```bash
systemctl status money-backend
systemctl restart money-backend
journalctl -u money-backend -f
```

## Telegram Mini App

В [@BotFather](https://t.me/BotFather) укажите URL:
`https://ellieene.github.io/cleaning-bot/`
