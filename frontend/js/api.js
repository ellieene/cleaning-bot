/**
 * Запросы к серверу
 */
const API = {
  baseUrl: CONFIG.API_URL,

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Ошибка сервера: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response;
  },

  getOrganizations() {
    return this.request('/api/organizations');
  },

  createPayment(data) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createOrganization(name) {
    return this.request('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  deleteOrganization(name) {
    return this.request('/api/organizations', {
      method: 'DELETE',
      body: JSON.stringify({ name }),
    });
  },

  deletePayment(organization, date) {
    return this.request('/api/payments', {
      method: 'DELETE',
      body: JSON.stringify({ organization, date }),
    });
  },

  async downloadExport(dateFrom, dateTo) {
    const params = new URLSearchParams({ from: dateFrom, to: dateTo });
    const response = await this.request(`/api/payments/export?${params}`, {
      headers: {},
    });

    const blob = await response.blob();
    const filename = `выплаты_${dateFrom}_${dateTo}.xlsx`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  },
};
