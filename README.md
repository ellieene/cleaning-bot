# Деньги Артема

Приложение для учёта выплат с Telegram Mini App.

## Запуск на сервере (Ubuntu)

```bash
git clone git@github.com:ellieene/cleaning-bot.git
cd cleaning-bot
bash install.sh
```

Уже склонировано — просто обновите и переустановите:

```bash
cd ~/cleaning-bot
git pull
bash install.sh
```

### Токен Telegram-бота

```bash
nano backend/.env
```

```
TELEGRAM_BOT_TOKEN=ваш_токен
HOST=0.0.0.0
PORT=5000
```

```bash
systemctl restart money-backend
```

### Проверка

```bash
curl http://localhost/api/health
```

Сайт откроется по IP сервера на порту 80.

## Структура

```
cleaning-bot/
├── install.sh         ← установка всего одной командой
├── frontend/          ← сайт (раздаёт nginx)
├── backend/           ← API + SQLite
└── deploy/            ← конфиги nginx и systemd
```

## Использование

**Главное меню:** организация → сумма → дата → «Записать»

**Скрытое меню:** 1 нажатие на логотип

## Полезные команды

```bash
systemctl status money-backend   # статус API
systemctl restart money-backend  # перезапуск API
systemctl restart nginx          # перезапуск сайта
journalctl -u money-backend -f   # логи API
```

## Telegram Mini App

1. [@BotFather](https://t.me/BotFather) → `/newapp`
2. URL: `http://ВАШ_IP/` (для продакшена нужен HTTPS и домен)
