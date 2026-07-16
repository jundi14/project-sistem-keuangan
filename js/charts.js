// ===================================================
// CHARTS MODULE
// Ponpes Al Muttaqin - Aplikasi Keuangan
// ===================================================

let chartInstances = {};

const Charts = {
  destroy(id) {
    if (chartInstances[id]) {
      chartInstances[id].destroy();
      delete chartInstances[id];
    }
  },

  renderCategoryChart(canvasId) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const stats = DataManager.getStats();

    const labels = CATEGORIES.map(c => c.name);
    const paidData = CATEGORIES.map(c => (stats.byCategory[c.id]?.paid || 0) / 1000000);
    const billedData = CATEGORIES.map(c => (stats.byCategory[c.id]?.billed || 0) / 1000000);
    const colors = CATEGORIES.map(c => c.color);

    chartInstances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Terbayar (Juta Rp)',
            data: paidData,
            backgroundColor: colors.map(c => c + 'cc'),
            borderColor: colors,
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: 'Total Tagihan (Juta Rp)',
            data: billedData,
            backgroundColor: colors.map(c => c + '33'),
            borderColor: colors.map(c => c + '66'),
            borderWidth: 1,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: Rp ${(ctx.raw * 1000000).toLocaleString('id-ID')}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        },
      },
    });
  },

  renderStatusDonut(canvasId) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const stats = DataManager.getStats();

    chartInstances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Lunas', 'Cicilan', 'Belum Bayar'],
        datasets: [{
          data: [stats.countPaid, stats.countPartial, stats.countUnpaid],
          backgroundColor: ['#10b981cc', '#f59e0bcc', '#ef4444cc'],
          borderColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 }, padding: 12 } },
        },
      },
    });
  },

  renderMonthlyChart(canvasId) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const payments = DataManager.getPayments().filter(p => p.status !== PAYMENT_STATUS.UNPAID);
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    months.forEach((m, i) => { monthlyData[i + 1] = 0; });

    payments.forEach(p => {
      if (p.paymentDate) {
        const month = new Date(p.paymentDate).getMonth() + 1;
        monthlyData[month] = (monthlyData[month] || 0) + p.paidAmount;
      }
    });

    chartInstances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Total Pembayaran (Rp)',
          data: Object.values(monthlyData).map(v => v / 1000000),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.15)',
          borderWidth: 2.5,
          pointBackgroundColor: '#6366f1',
          pointRadius: 5,
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` Total: Rp ${(ctx.raw * 1000000).toLocaleString('id-ID')}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
          y: { ticks: { color: '#94a3b8', callback: v => `${v}jt` }, grid: { color: '#1e293b' } },
        },
      },
    });
  },
};
