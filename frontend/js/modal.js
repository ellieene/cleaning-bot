/**
 * Общие функции для модальных окон
 */
const ModalHelper = {
  open(overlay) {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  },

  close(overlay, messageEl) {
    overlay.hidden = true;
    if (messageEl) this.clearMessage(messageEl);
    document.body.style.overflow = '';
  },

  showMessage(el, text, type) {
    el.textContent = text;
    el.className = `modal-message ${type}`;
    el.hidden = false;
  },

  clearMessage(el) {
    el.hidden = true;
    el.textContent = '';
    el.className = 'modal-message';
  },

  bindClose(overlay, closeBtn, messageEl) {
    closeBtn.addEventListener('click', () => this.close(overlay, messageEl));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(overlay, messageEl);
    });
  },
};

/**
 * Модальное окно добавления организации
 */
const OrgModal = {
  overlay: null,
  input: null,
  message: null,
  saveBtn: null,
  closeBtn: null,

  init() {
    this.overlay = document.getElementById('addOrgModal');
    this.input = document.getElementById('newOrganization');
    this.message = document.getElementById('modalMessage');
    this.saveBtn = document.getElementById('saveOrganizationBtn');
    this.closeBtn = document.getElementById('closeAddOrgBtn');

    document.getElementById('openAddOrgBtn').addEventListener('click', () => this.open());
    ModalHelper.bindClose(this.overlay, this.closeBtn, this.message);
    ModalHelper.close(this.overlay, this.message);
  },

  open() {
    ModalHelper.clearMessage(this.message);
    this.input.value = '';
    ModalHelper.open(this.overlay);
    this.input.focus();
  },

  close() {
    ModalHelper.close(this.overlay, this.message);
  },

  showMessage(text, type) {
    ModalHelper.showMessage(this.message, text, type);
  },

  clearMessage() {
    ModalHelper.clearMessage(this.message);
  },
};
