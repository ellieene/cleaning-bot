#!/usr/bin/env bash
set -e

# На Ubuntu sh часто ссылается на dash — перезапускаем через bash
if [ -z "${BASH_VERSION:-}" ]; then
    exec bash "$0" "$@"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Деньги Артема — запуск сервера ==="

# Установка системных зависимостей (Ubuntu)
if command -v apt-get &> /dev/null; then
    echo "Проверка системных пакетов..."
    apt-get update -qq
    apt-get install -y -qq python3 python3-venv python3-pip > /dev/null 2>&1 || true
fi

# Виртуальное окружение
if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Установка Python-зависимостей..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Файл окружения
if [ ! -f ".env" ]; then
    echo "Создание .env из .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  Отредактируйте файл .env и укажите TELEGRAM_BOT_TOKEN"
    echo ""
fi

# Папка для базы данных
mkdir -p data

# Загрузка переменных из .env
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

PORT="${PORT:-5000}"

echo ""
echo "Запуск сервера на порту ${PORT}..."
echo "Для остановки нажмите Ctrl+C"
echo ""

exec venv/bin/gunicorn -w 2 -b "0.0.0.0:${PORT}" server:app
