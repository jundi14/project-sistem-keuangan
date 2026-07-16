// ===================================================
// UTILITY FUNCTIONS
// Ponpes Al Muttaqin - Aplikasi Keuangan
// ===================================================

const Utils = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    }).format(new Date(dateStr));
  },

  formatDateShort(dateStr) {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(dateStr));
  },

  getMonthName(month) {
    const months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month] || '';
  },

  getStatusBadge(status) {
    const map = {
      lunas: { text: 'Lunas', class: 'badge-success' },
      cicilan: { text: 'Cicilan', class: 'badge-warning' },
      belum: { text: 'Belum Bayar', class: 'badge-danger' },
    };
    return map[status] || { text: status, class: 'badge-secondary' };
  },

  getCategoryInfo(categoryId) {
    return CATEGORIES.find(c => c.id === categoryId) || { name: categoryId, icon: '📋', color: '#64748b' };
  },

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  confirm(message) {
    return window.confirm(message);
  },

  getProgressPercent(paid, total) {
    if (!total) return 0;
    return Math.min(100, Math.round((paid / total) * 100));
  },

  printReceipt(payment, student, bill) {
    const win = window.open('', '_blank', 'width=400,height=600');
    const cat = Utils.getCategoryInfo(payment.category);
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kwitansi ${payment.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
          .header h2 { margin: 0; font-size: 16px; }
          .header p { margin: 2px 0; color: #555; }
          .receipt-no { font-size: 11px; color: #888; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 5px 0; }
          td:first-child { color: #555; width: 45%; }
          td:last-child { font-weight: 600; }
          .amount-row td { font-size: 16px; color: #2d6a4f; border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 10px; }
          .footer { margin-top: 20px; text-align: right; }
          .stamp { border: 2px solid #333; display: inline-block; padding: 8px 16px; border-radius: 4px; margin-top: 30px; font-size: 11px; }
          @media print { body { padding: 5px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>KWITANSI PEMBAYARAN</h2>
          <p>Ponpes Al Muttaqin</p>
          <div class="receipt-no">No: ${payment.receiptNo || '-'}</div>
        </div>
        <table>
          <tr><td>Tanggal Bayar</td><td>${Utils.formatDate(payment.paymentDate)}</td></tr>
          <tr><td>Nama Siswa</td><td>${student?.name || '-'}</td></tr>
          <tr><td>Kelas</td><td>${student?.class || '-'}</td></tr>
          <tr><td>NIS</td><td>${student?.nis || '-'}</td></tr>
          <tr><td>Keterangan</td><td>${cat.icon} ${bill?.description || cat.name}</td></tr>
          <tr><td>Metode Bayar</td><td>${payment.paymentMethod || '-'}</td></tr>
          <tr><td>Status</td><td>${payment.status === 'lunas' ? 'LUNAS' : 'CICILAN'}</td></tr>
          <tr class="amount-row"><td>Jumlah Bayar</td><td>${Utils.formatCurrency(payment.paidAmount)}</td></tr>
        </table>
        ${payment.notes ? `<p style="margin-top:10px; color:#555; font-size:12px;">Catatan: ${payment.notes}</p>` : ''}
        <div class="footer">
          <div class="stamp">Tanda Tangan Petugas</div>
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `);
    win.document.close();
  },
};
