#!/usr/bin/env bash
set -e

if [ -z "${BASH_VERSION:-}" ]; then
    exec bash "$0" "$@"
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "=========================================="
echo "  Деньги Артема — установка на сервер"
echo "=========================================="
echo "Папка проекта: $PROJECT_DIR"
echo ""

# Системные пакеты
echo ">>> Установка пакетов..."
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip nginx > /dev/null

# Backend: venv и зависимости
echo ">>> Настройка backend..."
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  Создан backend/.env — укажите TELEGRAM_BOT_TOKEN:"
    echo "    nano $BACKEND_DIR/.env"
    echo ""
fi

mkdir -p data

# Nginx
echo ">>> Настройка nginx..."
sed "s|PROJECT_DIR|$PROJECT_DIR|g" "$PROJECT_DIR/deploy/nginx.conf" \
    > /etc/nginx/sites-available/cleaning-bot

ln -sf /etc/nginx/sites-available/cleaning-bot /etc/nginx/sites-enabled/cleaning-bot
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

# Systemd сервис backend
echo ">>> Настройка автозапуска backend..."
sed "s|PROJECT_DIR|$PROJECT_DIR|g" "$PROJECT_DIR/deploy/money-backend.service" \
    > /etc/systemd/system/money-backend.service

systemctl daemon-reload
systemctl enable money-backend
systemctl restart money-backend

# Файрвол
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp  > /dev/null 2>&1 || true
    ufw allow 443/tcp > /dev/null 2>&1 || true
fi

# Проверка
sleep 2
echo ""
echo "=========================================="
if curl -sf http://127.0.0.1/api/health > /dev/null; then
    echo "  ✅ Всё работает!"
else
    echo "  ⚠️  Backend не отвечает — проверьте:"
    echo "     systemctl status money-backend"
fi
echo "=========================================="
echo ""
echo "Сайт:    http://$(curl -sf ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "API:     http://$(curl -sf ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')/api/health"
echo ""
echo "Не забудьте указать токен бота:"
echo "  nano $BACKEND_DIR/.env"
echo "  systemctl restart money-backend"
echo ""
