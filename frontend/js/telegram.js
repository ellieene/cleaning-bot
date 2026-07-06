/**
 * Интеграция с Telegram Mini App
 */
const TelegramApp = {
  tg: window.Telegram?.WebApp,

  init() {
    if (!this.tg) return;

    this.tg.ready();
    this.tg.expand();

    if (this.tg.colorScheme === 'dark') {
      document.body.classList.add('tg-dark');
    }

    if (this.tg.themeParams) {
      const tp = this.tg.themeParams;
      if (tp.bg_color) {
        document.body.style.background = tp.bg_color;
      }
    }

    this.tg.MainButton.hide();
  },

  haptic(type = 'success') {
    if (this.tg?.HapticFeedback) {
      if (type === 'success') {
        this.tg.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        this.tg.HapticFeedback.notificationOccurred('error');
      } else {
        this.tg.HapticFeedback.impactOccurred('light');
      }
    }
  },

  getUserId() {
    return this.tg?.initDataUnsafe?.user?.id || null;
  },
};
