/**
 * Модальные окна удаления организации и записи
 */
document.addEventListener('DOMContentLoaded', () => {
  DeleteOrgModal.init();
  DeletePaymentModal.init();
});

const DeleteOrgModal = {
  overlay: null,
  select: null,
  message: null,
  confirmBtn: null,
  closeBtn: null,

  init() {
    this.overlay = document.getElementById('deleteOrgModal');
    this.select = document.getElementById('deleteOrgSelect');
    this.message = document.getElementById('deleteOrgMessage');
    this.confirmBtn = document.getElementById('confirmDeleteOrgBtn');
    this.closeBtn = document.getElementById('closeDeleteOrgBtn');

    document.getElementById('openDeleteOrgBtn').addEventListener('click', () => this.open());
    ModalHelper.bindClose(this.overlay, this.closeBtn, this.message);
    this.confirmBtn.addEventListener('click', () => this.submit());
    ModalHelper.close(this.overlay, this.message);
  },

  async open() {
    ModalHelper.clearMessage(this.message);
    await loadOrganizations(this.select);
    ModalHelper.open(this.overlay);
  },

  close() {
    ModalHelper.close(this.overlay, this.message);
  },

  async submit() {
    const name = this.select.value;

    if (!name) {
      ModalHelper.showMessage(this.message, 'Выберите организацию', 'error');
      TelegramApp.haptic('error');
      return;
    }

    ModalHelper.clearMessage(this.message);
    this.confirmBtn.disabled = true;
    this.confirmBtn.textContent = 'Удаление...';

    try {
      await API.deleteOrganization(name);
      await loadOrganizations(document.getElementById('organization'));
      showToast(document.getElementById('toast'), `Организация «${name}» удалена`, 'success');
      TelegramApp.haptic('success');
      this.close();
    } catch (err) {
      ModalHelper.showMessage(this.message, err.message || 'Ошибка при удалении', 'error');
      TelegramApp.haptic('error');
    } finally {
      this.confirmBtn.disabled = false;
      this.confirmBtn.textContent = 'Удалить';
    }
  },
};

const DeletePaymentModal = {
  overlay: null,
  select: null,
  dateInput: null,
  message: null,
  confirmBtn: null,
  closeBtn: null,

  init() {
    this.overlay = document.getElementById('deletePaymentModal');
    this.select = document.getElementById('deletePaymentOrg');
    this.dateInput = document.getElementById('deletePaymentDate');
    this.message = document.getElementById('deletePaymentMessage');
    this.confirmBtn = document.getElementById('confirmDeletePaymentBtn');
    this.closeBtn = document.getElementById('closeDeletePaymentBtn');

    document.getElementById('openDeletePaymentBtn').addEventListener('click', () => this.open());
    ModalHelper.bindClose(this.overlay, this.closeBtn, this.message);
    this.confirmBtn.addEventListener('click', () => this.submit());
    ModalHelper.close(this.overlay, this.message);
  },

  async open() {
    ModalHelper.clearMessage(this.message);
    await loadOrganizations(this.select);
    setTodayDate(this.dateInput);
    ModalHelper.open(this.overlay);
  },

  close() {
    ModalHelper.close(this.overlay, this.message);
  },

  async submit() {
    const organization = this.select.value;
    const date = this.dateInput.value;

    if (!organization || !date) {
      ModalHelper.showMessage(this.message, 'Выберите организацию и дату', 'error');
      TelegramApp.haptic('error');
      return;
    }

    ModalHelper.clearMessage(this.message);
    this.confirmBtn.disabled = true;
    this.confirmBtn.textContent = 'Удаление...';

    try {
      const result = await API.deletePayment(organization, date);
      showToast(document.getElementById('toast'), result.message || 'Запись удалена', 'success');
      TelegramApp.haptic('success');
      this.close();
    } catch (err) {
      ModalHelper.showMessage(this.message, err.message || 'Ошибка при удалении', 'error');
      TelegramApp.haptic('error');
    } finally {
      this.confirmBtn.disabled = false;
      this.confirmBtn.textContent = 'Удалить';
    }
  },
};
