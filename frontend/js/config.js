/**
 * Настройки приложения
 *
 * GitHub Pages (HTTPS) → API на сервере через nip.io (HTTPS)
 * Локально → localhost:5050
 * На VPS → тот же домен (/api)
 */
const CONFIG = {
  API_URL: (() => {
    const host = location.hostname;

    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5050';
    }

    if (host === 'ellieene.github.io') {
      return 'https://161-104-17-204.nip.io';
    }

    return '';
  })(),
};
