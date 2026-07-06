/**
 * Скрытое меню — выгрузка таблицы выплат
 */
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo');
  const mainMenu = document.getElementById('mainMenu');
  const hiddenMenu = document.getElementById('hiddenMenu');
  const exportMenu = document.getElementById('exportMenu');
  const closeHiddenBtn = document.getElementById('closeHiddenBtn');
  const closeExportBtn = document.getElementById('closeExportBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const openDownloadBtn = document.getElementById('openDownloadBtn');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');

  logo.addEventListener('click', () => {
    openHiddenMenu(mainMenu, hiddenMenu, exportMenu);
    TelegramApp.haptic('light');
  });

  openDownloadBtn.addEventListener('click', () => {
    openExportMenu(hiddenMenu, exportMenu, dateFrom, dateTo);
  });

  closeHiddenBtn.addEventListener('click', () => {
    closeHiddenMenu(mainMenu, hiddenMenu, exportMenu);
  });

  closeExportBtn.addEventListener('click', () => {
    exportMenu.hidden = true;
    hiddenMenu.hidden = false;
  });

  downloadBtn.addEventListener('click', async () => {
    await downloadPayments(dateFrom, dateTo, downloadBtn);
  });
});

function openHiddenMenu(mainMenu, hiddenMenu, exportMenu) {
  exportMenu.hidden = true;
  mainMenu.hidden = true;
  hiddenMenu.hidden = false;
}

function openExportMenu(hiddenMenu, exportMenu, dateFrom, dateTo) {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  dateTo.value = formatDate(today);
  dateFrom.value = formatDate(monthAgo);

  hiddenMenu.hidden = true;
  exportMenu.hidden = false;
}

function closeHiddenMenu(mainMenu, hiddenMenu, exportMenu) {
  hiddenMenu.hidden = true;
  exportMenu.hidden = true;
  mainMenu.hidden = false;
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function downloadPayments(dateFrom, dateTo, btn) {
  const from = dateFrom.value;
  const to = dateTo.value;

  if (!from || !to) {
    alert('Укажите период');
    return;
  }

  if (from > to) {
    alert('Дата «С» не может быть позже даты «По»');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Загрузка...';

  try {
    await API.downloadExport(from, to);
    TelegramApp.haptic('success');
  } catch (err) {
    alert(err.message || 'Ошибка при скачивании');
    TelegramApp.haptic('error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Скачать таблицу выплат';
  }
}
