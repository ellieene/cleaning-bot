/**
 * Настройки приложения
 */
const CONFIG = {
  API_URL:
    location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? 'http://localhost:5050'
      : 'https://161-104-17-204.nip.io',
};
