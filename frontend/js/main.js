/**
 * Главное меню — форма записи выплат
 */
document.addEventListener('DOMContentLoaded', () => {
  TelegramApp.init();
  OrgModal.init();

  const form = document.getElementById('paymentForm');
  const organizationSelect = document.getElementById('organization');
  const dateInput = document.getElementById('date');
  const submitBtn = document.getElementById('submitBtn');
  const toast = document.getElementById('toast');

  setTodayDate(dateInput);
  loadOrganizations(organizationSelect);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitPayment(form, submitBtn, toast);
  });

  OrgModal.saveBtn.addEventListener('click', async () => {
    await submitOrganization(organizationSelect);
  });

  OrgModal.input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await submitOrganization(organizationSelect);
    }
  });
});

function setTodayDate(input) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  input.value = `${yyyy}-${mm}-${dd}`;
}

async function loadOrganizations(select, selectedName = '') {
  try {
    const data = await API.getOrganizations();
    select.innerHTML = '<option value="" disabled>Выберите организацию</option>';
    data.organizations.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      if (name === selectedName) option.selected = true;
      select.appendChild(option);
    });
    if (!selectedName) {
      select.querySelector('option[value=""]').selected = true;
    }
  } catch (err) {
    showToast(document.getElementById('toast'), 'Не удалось загрузить организации', 'error');
    console.error(err);
  }
}

async function submitOrganization(select) {
  const name = OrgModal.input.value.trim();

  if (!name) {
    OrgModal.showMessage('Введите название организации', 'error');
    TelegramApp.haptic('error');
    return;
  }

  OrgModal.clearMessage();
  OrgModal.saveBtn.disabled = true;
  OrgModal.saveBtn.textContent = 'Сохранение...';

  try {
    await API.createOrganization(name);
    await loadOrganizations(select, name);
    TelegramApp.haptic('success');
    OrgModal.close();
    showToast(document.getElementById('toast'), `Организация «${name}» добавлена`, 'success');
  } catch (err) {
    OrgModal.showMessage(err.message || 'Ошибка при добавлении организации', 'error');
    TelegramApp.haptic('error');
  } finally {
    OrgModal.saveBtn.disabled = false;
    OrgModal.saveBtn.textContent = 'Сохранить';
  }
}

async function submitPayment(form, submitBtn, toast) {
  const organization = form.organization.value;
  const amount = parseFloat(form.amount.value);
  const date = form.date.value;

  if (!organization || isNaN(amount) || amount <= 0) {
    showToast(toast, 'Заполните все поля корректно', 'error');
    TelegramApp.haptic('error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Сохранение...';

  try {
    await API.createPayment({
      organization,
      amount,
      date,
      telegram_user_id: TelegramApp.getUserId(),
    });

    showToast(toast, 'Запись сохранена!', 'success');
    TelegramApp.haptic('success');
    form.amount.value = '';
    setTodayDate(form.date);
  } catch (err) {
    showToast(toast, err.message || 'Ошибка при сохранении', 'error');
    TelegramApp.haptic('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Записать';
  }
}

function showToast(el, message, type) {
  el.textContent = message;
  el.className = `toast ${type}`;
  el.hidden = false;

  setTimeout(() => {
    el.hidden = true;
  }, 3000);
}
