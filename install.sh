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

API_DOMAIN="161-104-17-204.nip.io"
SERVER_IP="161.104.17.204"

# Nginx
echo ">>> Настройка nginx..."
sed "s|PROJECT_DIR|$PROJECT_DIR|g" "$PROJECT_DIR/deploy/nginx.conf" \
    > /etc/nginx/sites-available/cleaning-bot

ln -sf /etc/nginx/sites-available/cleaning-bot /etc/nginx/sites-enabled/cleaning-bot
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

# HTTPS для API (нужно для GitHub Pages)
echo ">>> Настройка HTTPS ($API_DOMAIN)..."
apt-get install -y -qq certbot python3-certbot-nginx > /dev/null 2>&1 || true
if certbot --nginx -d "$API_DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect 2>/dev/null; then
    echo "    SSL сертификат установлен"
else
    echo "    ⚠️  Certbot не смог выдать сертификат — запустите вручную:"
    echo "    certbot --nginx -d $API_DOMAIN"
fi

# Systemd сервис backend
echo ">>> Настройка автозапуска backend..."
sed "s|PROJECT_DIR|$PROJECT_DIR|g" "$PROJECT_DIR/deploy/money-backend.service" \
    > /etc/systemd/system/money-backend.service

systemctl daemon-reload
systemctl enable money-backend
systemctl restart money-backend

# Ждём запуск gunicorn
sleep 4

# Файрвол
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp  > /dev/null 2>&1 || true
    ufw allow 443/tcp > /dev/null 2>&1 || true
fi

# Проверка
echo ""
echo "=========================================="
BACKEND_OK=0

if curl -sf http://127.0.0.1:5000/api/health > /dev/null 2>&1; then
    echo "  ✅ Gunicorn работает (порт 5000)"
    BACKEND_OK=1
else
    echo "  ❌ Gunicorn не отвечает на порту 5000"
    echo ""
    echo "  Логи backend:"
    journalctl -u money-backend -n 15 --no-pager 2>/dev/null || true
fi

if curl -sf "https://$API_DOMAIN/api/health" > /dev/null 2>&1; then
    echo "  ✅ API через nginx/HTTPS работает"
    BACKEND_OK=1
elif curl -sf http://127.0.0.1/api/health > /dev/null 2>&1; then
    echo "  ✅ API через nginx (HTTP) работает"
    BACKEND_OK=1
else
    echo "  ⚠️  API через nginx не отвечает"
fi

if [ "$BACKEND_OK" -eq 0 ]; then
    echo ""
    echo "  Попробуйте вручную:"
    echo "    systemctl status money-backend"
    echo "    journalctl -u money-backend -f"
fi
echo "=========================================="
echo ""
echo "Фронтенд:  https://ellieene.github.io/cleaning-bot/"
echo "API:       https://$API_DOMAIN/api/health"
echo "IP:        http://$SERVER_IP/api/health"
echo ""
echo "Не забудьте указать токен бота:"
echo "  nano $BACKEND_DIR/.env"
echo "  systemctl restart money-backend"
echo ""
