/**
 * Настройки приложения
 * На сервере API идёт через nginx (/api → backend)
 * Локально — напрямую на порт 5050
 */
const CONFIG = {
  API_URL: location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:5050'
    : '',
};
