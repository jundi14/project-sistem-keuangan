// ===================================================
// MAIN APPLICATION MODULE
// Ponpes Al Muttaqin - Aplikasi Keuangan
// ===================================================

let currentPage = 'dashboard';
let filterState = {
  search: '',
  category: 'all',
  status: 'all',
  class: 'all',
  month: 'all',
};

// ====== NAVIGATION ======
const PAGE_TITLES = {
  dashboard: ['📊 Dashboard', 'Ringkasan keuangan sekolah'],
  students: ['👨‍🎓 Data Siswa', 'Kelola data siswa'],
  payments: ['💰 Riwayat Pembayaran', 'Semua transaksi keuangan'],
  bills: ['📋 Manajemen Tagihan', 'Kelola tagihan siswa'],
  report: ['📈 Laporan Keuangan', 'Analisis dan rekap keuangan'],
};

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.querySelector(`[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  // Update topbar
  const info = PAGE_TITLES[page];
  if (info) {
    const titleEl = document.getElementById('topbar-title');
    const subEl = document.getElementById('topbar-subtitle');
    if (titleEl) titleEl.textContent = info[0];
    if (subEl) subEl.textContent = info[1];
  }

  // Close sidebar on mobile
  document.getElementById('sidebar')?.classList.remove('open');

  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'students': renderStudents(); break;
    case 'payments': renderPayments(); break;
    case 'bills': renderBills(); break;
    case 'report': renderReport(); break;
  }
}

// ====== DASHBOARD ======
function renderDashboard() {
  const stats = DataManager.getStats();
  const students = DataManager.getStudents();

  document.getElementById('stat-total-billed').textContent = Utils.formatCurrency(stats.totalBilled);
  document.getElementById('stat-total-paid').textContent = Utils.formatCurrency(stats.totalPaid);
  document.getElementById('stat-total-unpaid').textContent = Utils.formatCurrency(stats.totalUnpaid);
  document.getElementById('stat-students').textContent = students.length;

  const progressPct = Utils.getProgressPercent(stats.totalPaid, stats.totalBilled);
  document.getElementById('overall-progress-bar').style.width = progressPct + '%';
  document.getElementById('overall-progress-text').textContent = progressPct + '%';

  // Category stats
  const catGrid = document.getElementById('category-stats-grid');
  if (catGrid) {
    catGrid.innerHTML = CATEGORIES.map(cat => {
      const d = stats.byCategory[cat.id] || { billed: 0, paid: 0 };
      const pct = Utils.getProgressPercent(d.paid, d.billed);
      return `
        <div class="cat-stat-card" style="border-left: 3px solid ${cat.color}">
          <div class="cat-stat-header">
            <span class="cat-icon">${cat.icon}</span>
            <span class="cat-name">${cat.name}</span>
          </div>
          <div class="cat-stat-amount">${Utils.formatCurrency(d.paid)}</div>
          <div class="cat-stat-sub">dari ${Utils.formatCurrency(d.billed)}</div>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width:${pct}%; background:${cat.color}"></div>
          </div>
          <div class="cat-stat-pct">${pct}% terbayar</div>
        </div>
      `;
    }).join('');
  }

  // Recent transactions
  const payments = DataManager.getPayments()
    .filter(p => p.status !== PAYMENT_STATUS.UNPAID)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
    .slice(0, 8);

  const studentMap = {};
  DataManager.getStudents().forEach(s => studentMap[s.id] = s);

  const recentList = document.getElementById('recent-transactions');
  if (recentList) {
    recentList.innerHTML = payments.length === 0
      ? '<div class="empty-state"><span>Belum ada transaksi</span></div>'
      : payments.map(p => {
        const s = studentMap[p.studentId];
        const cat = Utils.getCategoryInfo(p.category);
        const badge = Utils.getStatusBadge(p.status);
        return `
          <div class="transaction-item">
            <div class="txn-avatar" style="background:${cat.color}22; color:${cat.color}">${cat.icon}</div>
            <div class="txn-info">
              <div class="txn-name">${s?.name || 'Unknown'}</div>
              <div class="txn-desc">${cat.name} • ${s?.class || '-'}</div>
            </div>
            <div class="txn-right">
              <div class="txn-amount">+${Utils.formatCurrency(p.paidAmount)}</div>
              <div class="txn-date">${Utils.formatDateShort(p.paymentDate)}</div>
              <span class="badge ${badge.class}">${badge.text}</span>
            </div>
          </div>
        `;
      }).join('');
  }

  // Render charts
  setTimeout(() => {
    Charts.renderStatusDonut('chart-status');
    Charts.renderMonthlyChart('chart-monthly');
    Charts.renderCategoryChart('chart-category');
  }, 100);

  // Tunggakan terbesar
  const unpaidPayments = DataManager.getPayments().filter(p => p.status !== PAYMENT_STATUS.PAID);
  const unpaidByStudent = {};
  unpaidPayments.forEach(p => {
    if (!unpaidByStudent[p.studentId]) unpaidByStudent[p.studentId] = 0;
    unpaidByStudent[p.studentId] += (p.amount - p.paidAmount);
  });
  const topUnpaid = Object.entries(unpaidByStudent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const tunggakanList = document.getElementById('tunggakan-list');
  if (tunggakanList) {
    tunggakanList.innerHTML = topUnpaid.length === 0
      ? '<div class="empty-state"><span>🎉 Semua tagihan lunas!</span></div>'
      : topUnpaid.map(([sid, amount]) => {
        const s = studentMap[sid];
        return `
          <div class="tunggakan-item" onclick="navigateTo('students'); setTimeout(()=>openStudentDetail('${sid}'),200)">
            <div class="tunggakan-avatar">${s?.name?.charAt(0) || '?'}</div>
            <div class="tunggakan-info">
              <div class="tunggakan-name">${s?.name || '-'}</div>
              <div class="tunggakan-class">${s?.class || '-'}</div>
            </div>
            <div class="tunggakan-amount">${Utils.formatCurrency(amount)}</div>
          </div>
        `;
      }).join('');
  }
}

// ====== STUDENTS ======
function renderStudents() {
  const students = DataManager.getStudents();
  const query = (document.getElementById('student-search')?.value || '').toLowerCase();
  const classFilter = document.getElementById('student-class-filter')?.value || 'all';

  const filtered = students.filter(s =>
    (!query || s.name.toLowerCase().includes(query) || s.nis.includes(query)) &&
    (classFilter === 'all' || s.class === classFilter)
  );

  const payments = DataManager.getPayments();
  const studentMap = {};
  students.forEach(s => studentMap[s.id] = s);

  const grid = document.getElementById('students-grid');
  if (!grid) return;

  grid.innerHTML = filtered.length === 0
    ? '<div class="empty-state full-width"><span>Tidak ada siswa ditemukan</span></div>'
    : filtered.map(s => {
      const pList = payments.filter(p => p.studentId === s.id);
      const totalBilled = pList.reduce((sum, p) => sum + p.amount, 0);
      const totalPaid = pList.reduce((sum, p) => sum + p.paidAmount, 0);
      const pct = Utils.getProgressPercent(totalPaid, totalBilled);
      const unpaidCount = pList.filter(p => p.status !== PAYMENT_STATUS.PAID).length;

      return `
        <div class="student-card" onclick="openStudentDetail('${s.id}')">
          <div class="student-card-header">
            <div class="student-avatar ${s.gender === 'P' ? 'female' : 'male'}">
              ${s.name.charAt(0)}
            </div>
            <div class="student-info">
              <div class="student-name">${s.name}</div>
              <div class="student-meta">${s.nis} · ${s.class}</div>
            </div>
            ${unpaidCount > 0 ? `<span class="unpaid-badge">${unpaidCount} tunggakan</span>` : '<span class="paid-badge">✓ Lunas</span>'}
          </div>
          <div class="student-payment-summary">
            <div class="payment-progress">
              <div class="progress-bar-wrap">
                <div class="progress-bar" style="width:${pct}%"></div>
              </div>
              <span>${pct}%</span>
            </div>
            <div class="payment-amounts">
              <span class="paid-amt">${Utils.formatCurrency(totalPaid)}</span>
              <span class="sep">/</span>
              <span class="total-amt">${Utils.formatCurrency(totalBilled)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

  document.getElementById('student-count').textContent = `${filtered.length} siswa`;
}

function openStudentDetail(studentId) {
  const student = DataManager.getStudents().find(s => s.id === studentId);
  if (!student) return;

  const payments = DataManager.getPayments().filter(p => p.studentId === studentId);
  const bills = DataManager.getBills().filter(b => b.studentId === studentId);

  const catFilter = document.getElementById('detail-cat-filter')?.value || 'all';
  const statusFilter = document.getElementById('detail-status-filter')?.value || 'all';

  const filteredPayments = payments.filter(p =>
    (catFilter === 'all' || p.category === catFilter) &&
    (statusFilter === 'all' || p.status === statusFilter)
  );

  const totalBilled = payments.reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.paidAmount, 0);
  const totalUnpaid = totalBilled - totalPaid;

  const modal = document.getElementById('student-detail-modal');
  modal.classList.add('active');
  modal.dataset.studentId = studentId;

  document.getElementById('detail-student-name').textContent = student.name;
  document.getElementById('detail-student-meta').textContent = `${student.nis} · Kelas ${student.class}`;
  document.getElementById('detail-total-billed').textContent = Utils.formatCurrency(totalBilled);
  document.getElementById('detail-total-paid').textContent = Utils.formatCurrency(totalPaid);
  document.getElementById('detail-total-unpaid').textContent = Utils.formatCurrency(totalUnpaid);

  const pct = Utils.getProgressPercent(totalPaid, totalBilled);
  document.getElementById('detail-progress-bar').style.width = pct + '%';
  document.getElementById('detail-progress-pct').textContent = pct + '%';

  const billMap = {};
  bills.forEach(b => billMap[b.id] = b);

  const paymentList = document.getElementById('detail-payment-list');
  paymentList.innerHTML = filteredPayments.length === 0
    ? '<div class="empty-state"><span>Tidak ada data</span></div>'
    : filteredPayments.map(p => {
      const cat = Utils.getCategoryInfo(p.category);
      const badge = Utils.getStatusBadge(p.status);
      const bill = billMap[p.billId];
      const remaining = p.amount - p.paidAmount;
      return `
        <div class="payment-row">
          <div class="payment-row-icon" style="background:${cat.color}22; color:${cat.color}">${cat.icon}</div>
          <div class="payment-row-info">
            <div class="payment-row-title">${bill?.description || cat.name}</div>
            <div class="payment-row-meta">Jatuh tempo: ${Utils.formatDateShort(bill?.dueDate)}</div>
            ${p.paymentDate ? `<div class="payment-row-meta">Dibayar: ${Utils.formatDateShort(p.paymentDate)} via ${p.paymentMethod || '-'}</div>` : ''}
          </div>
          <div class="payment-row-right">
            <div class="payment-row-amount">${Utils.formatCurrency(p.amount)}</div>
            <span class="badge ${badge.class}">${badge.text}</span>
            ${remaining > 0 ? `<div class="payment-row-remaining">Sisa: ${Utils.formatCurrency(remaining)}</div>` : ''}
            <div class="payment-row-actions">
              ${p.status !== PAYMENT_STATUS.PAID ? `<button class="btn btn-sm btn-primary" onclick="openPayModal('${p.id}', '${studentId}')">Bayar</button>` : ''}
              ${p.receiptNo ? `<button class="btn btn-sm btn-outline" onclick="printPaymentReceipt('${p.id}')">🖨️ Cetak</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
}

// ====== PAYMENTS (Riwayat Transaksi) ======
function renderPayments() {
  const payments = DataManager.getPayments();
  const students = DataManager.getStudents();
  const bills = DataManager.getBills();

  const studentMap = {};
  students.forEach(s => studentMap[s.id] = s);
  const billMap = {};
  bills.forEach(b => billMap[b.id] = b);

  const search = (document.getElementById('pay-search')?.value || '').toLowerCase();
  const catFilter = document.getElementById('pay-cat-filter')?.value || 'all';
  const statusFilter = document.getElementById('pay-status-filter')?.value || 'all';
  const classFilter = document.getElementById('pay-class-filter')?.value || 'all';

  const filtered = payments.filter(p => {
    const s = studentMap[p.studentId];
    const matchSearch = !search || s?.name.toLowerCase().includes(search) || s?.nis.includes(search);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchClass = classFilter === 'all' || s?.class === classFilter;
    return matchSearch && matchCat && matchStatus && matchClass;
  });

  const totalPaid = filtered.filter(p => p.status !== PAYMENT_STATUS.UNPAID).reduce((s, p) => s + p.paidAmount, 0);
  document.getElementById('pay-filtered-total').textContent = Utils.formatCurrency(totalPaid);
  document.getElementById('pay-filtered-count').textContent = filtered.length + ' transaksi';

  const tbody = document.getElementById('payments-tbody');
  if (!tbody) return;

  tbody.innerHTML = filtered.length === 0
    ? '<tr><td colspan="8" class="empty-state">Tidak ada data pembayaran</td></tr>'
    : filtered.map(p => {
      const s = studentMap[p.studentId];
      const cat = Utils.getCategoryInfo(p.category);
      const badge = Utils.getStatusBadge(p.status);
      const bill = billMap[p.billId];
      const remaining = p.amount - p.paidAmount;
      return `
        <tr>
          <td>
            <div class="tbl-student">
              <div class="tbl-avatar ${s?.gender === 'P' ? 'female' : 'male'}">${s?.name?.charAt(0) || '?'}</div>
              <div>
                <div class="tbl-name">${s?.name || '-'}</div>
                <div class="tbl-meta">${s?.class || '-'} · ${s?.nis || '-'}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="cat-badge" style="background:${cat.color}22; color:${cat.color}; border:1px solid ${cat.color}44">
              ${cat.icon} ${cat.name}
            </span>
          </td>
          <td>${bill?.description || '-'}</td>
          <td>${Utils.formatCurrency(p.amount)}</td>
          <td>${Utils.formatCurrency(p.paidAmount)}</td>
          <td>${remaining > 0 ? `<span class="text-danger">${Utils.formatCurrency(remaining)}</span>` : '<span class="text-success">✓ Lunas</span>'}</td>
          <td><span class="badge ${badge.class}">${badge.text}</span></td>
          <td>
            <div class="action-btns">
              ${p.status !== PAYMENT_STATUS.PAID ? `<button class="btn btn-sm btn-primary" onclick="openPayModal('${p.id}', '${p.studentId}')">Bayar</button>` : ''}
              ${p.receiptNo ? `<button class="btn btn-sm btn-outline" onclick="printPaymentReceipt('${p.id}')">🖨️</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
}

// ====== BILLS ======
function renderBills() {
  const bills = DataManager.getBills();
  const students = DataManager.getStudents();
  const payments = DataManager.getPayments();

  const studentMap = {};
  students.forEach(s => studentMap[s.id] = s);
  const paymentByBill = {};
  payments.forEach(p => paymentByBill[p.billId] = p);

  const search = (document.getElementById('bill-search')?.value || '').toLowerCase();
  const catFilter = document.getElementById('bill-cat-filter')?.value || 'all';
  const classFilter = document.getElementById('bill-class-filter')?.value || 'all';

  const filtered = bills.filter(b => {
    const s = studentMap[b.studentId];
    const matchSearch = !search || s?.name.toLowerCase().includes(search) || b.description.toLowerCase().includes(search);
    const matchCat = catFilter === 'all' || b.category === catFilter;
    const matchClass = classFilter === 'all' || s?.class === classFilter;
    return matchSearch && matchCat && matchClass;
  });

  const tbody = document.getElementById('bills-tbody');
  if (!tbody) return;

  tbody.innerHTML = filtered.length === 0
    ? '<tr><td colspan="7" class="empty-state">Tidak ada tagihan ditemukan</td></tr>'
    : filtered.map(b => {
      const s = studentMap[b.studentId];
      const cat = Utils.getCategoryInfo(b.category);
      const p = paymentByBill[b.id];
      const badge = p ? Utils.getStatusBadge(p.status) : Utils.getStatusBadge('belum');
      const paidAmt = p?.paidAmount || 0;
      return `
        <tr>
          <td>
            <div class="tbl-student">
              <div class="tbl-avatar ${s?.gender === 'P' ? 'female' : 'male'}">${s?.name?.charAt(0) || '?'}</div>
              <div>
                <div class="tbl-name">${s?.name || '-'}</div>
                <div class="tbl-meta">${s?.class || '-'}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="cat-badge" style="background:${cat.color}22; color:${cat.color}; border:1px solid ${cat.color}44">
              ${cat.icon} ${cat.name}
            </span>
          </td>
          <td>${b.description}</td>
          <td>${Utils.formatCurrency(b.amount)}</td>
          <td>${Utils.formatDateShort(b.dueDate)}</td>
          <td><span class="badge ${badge.class}">${badge.text}</span></td>
          <td>
            <div class="action-btns">
              ${p && p.status !== PAYMENT_STATUS.PAID ? `<button class="btn btn-sm btn-primary" onclick="openPayModal('${p.id}', '${b.studentId}')">Bayar</button>` : ''}
              <button class="btn btn-sm btn-danger-outline" onclick="deleteBill('${b.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

  document.getElementById('bills-count').textContent = filtered.length + ' tagihan';
}

// ====== REPORT ======
function renderReport() {
  const stats = DataManager.getStats();
  const payments = DataManager.getPayments();
  const students = DataManager.getStudents();

  document.getElementById('report-total-billed').textContent = Utils.formatCurrency(stats.totalBilled);
  document.getElementById('report-total-paid').textContent = Utils.formatCurrency(stats.totalPaid);
  document.getElementById('report-total-unpaid').textContent = Utils.formatCurrency(stats.totalUnpaid);
  document.getElementById('report-collection-rate').textContent =
    Utils.getProgressPercent(stats.totalPaid, stats.totalBilled) + '%';

  // Category breakdown
  const catTable = document.getElementById('report-cat-table');
  if (catTable) {
    catTable.innerHTML = CATEGORIES.map(cat => {
      const d = stats.byCategory[cat.id] || { billed: 0, paid: 0 };
      const pct = Utils.getProgressPercent(d.paid, d.billed);
      return `
        <tr>
          <td><span class="cat-badge" style="background:${cat.color}22; color:${cat.color}">${cat.icon} ${cat.name}</span></td>
          <td>${Utils.formatCurrency(d.billed)}</td>
          <td>${Utils.formatCurrency(d.paid)}</td>
          <td>${Utils.formatCurrency(d.billed - d.paid)}</td>
          <td>
            <div class="report-progress-wrap">
              <div class="progress-bar-wrap" style="flex:1">
                <div class="progress-bar" style="width:${pct}%; background:${cat.color}"></div>
              </div>
              <span>${pct}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Class breakdown
  const classMap = {};
  students.forEach(s => {
    if (!classMap[s.class]) classMap[s.class] = { students: 0, billed: 0, paid: 0 };
    classMap[s.class].students++;
  });
  payments.forEach(p => {
    const s = students.find(st => st.id === p.studentId);
    if (s && classMap[s.class]) {
      classMap[s.class].billed += p.amount;
      classMap[s.class].paid += p.paidAmount;
    }
  });

  const classTable = document.getElementById('report-class-table');
  if (classTable) {
    classTable.innerHTML = Object.entries(classMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([cls, d]) => {
        const pct = Utils.getProgressPercent(d.paid, d.billed);
        return `
          <tr>
            <td><strong>${cls}</strong></td>
            <td>${d.students} siswa</td>
            <td>${Utils.formatCurrency(d.billed)}</td>
            <td>${Utils.formatCurrency(d.paid)}</td>
            <td>${Utils.formatCurrency(d.billed - d.paid)}</td>
            <td>${pct}%</td>
          </tr>
        `;
      }).join('');
  }

  setTimeout(() => Charts.renderCategoryChart('report-chart-category'), 100);
}

// ====== MODALS ======
function openPayModal(paymentId, studentId) {
  const payment = DataManager.getPayments().find(p => p.id === paymentId);
  const student = DataManager.getStudents().find(s => s.id === studentId);
  const bill = DataManager.getBills().find(b => b.id === payment?.billId);
  if (!payment || !student) return;

  const cat = Utils.getCategoryInfo(payment.category);
  const remaining = payment.amount - payment.paidAmount;

  document.getElementById('pay-modal-title').textContent = `Pembayaran ${cat.name}`;
  document.getElementById('pay-modal-student').textContent = student.name;
  document.getElementById('pay-modal-class').textContent = student.class;
  document.getElementById('pay-modal-desc').textContent = bill?.description || cat.name;
  document.getElementById('pay-modal-total').textContent = Utils.formatCurrency(payment.amount);
  document.getElementById('pay-modal-paid').textContent = Utils.formatCurrency(payment.paidAmount);
  document.getElementById('pay-modal-remaining').textContent = Utils.formatCurrency(remaining);
  document.getElementById('pay-modal-amount').value = remaining;
  document.getElementById('pay-modal-amount').max = remaining;
  document.getElementById('pay-modal-method').value = 'tunai';
  document.getElementById('pay-modal-notes').value = '';
  document.getElementById('payment-modal').dataset.paymentId = paymentId;
  document.getElementById('payment-modal').dataset.studentId = studentId;
  document.getElementById('payment-modal').classList.add('active');
}

function submitPayment() {
  const modal = document.getElementById('payment-modal');
  const paymentId = modal.dataset.paymentId;
  const studentId = modal.dataset.studentId;
  const amount = parseFloat(document.getElementById('pay-modal-amount').value) || 0;
  const method = document.getElementById('pay-modal-method').value;
  const notes = document.getElementById('pay-modal-notes').value;

  if (amount <= 0) { Utils.showToast('Jumlah bayar harus lebih dari 0', 'error'); return; }

  const payment = DataManager.getPayments().find(p => p.id === paymentId);
  const remaining = payment.amount - payment.paidAmount;
  if (amount > remaining) { Utils.showToast('Jumlah melebihi sisa tagihan', 'error'); return; }

  DataManager.updatePayment(paymentId, amount, method, notes);
  Utils.showToast('Pembayaran berhasil dicatat! ✅', 'success');
  closeModal('payment-modal');

  // Re-render current page and if student detail is open, refresh it
  renderPage(currentPage);
  const detailModal = document.getElementById('student-detail-modal');
  if (detailModal.classList.contains('active') && detailModal.dataset.studentId) {
    openStudentDetail(detailModal.dataset.studentId);
  }
}

function openAddStudentModal() {
  document.getElementById('student-form').reset();
  document.getElementById('student-modal-title').textContent = 'Tambah Siswa Baru';
  document.getElementById('student-form').dataset.editId = '';
  document.getElementById('student-modal').classList.add('active');
}

function openEditStudentModal(id) {
  const student = DataManager.getStudents().find(s => s.id === id);
  if (!student) return;
  document.getElementById('student-modal-title').textContent = 'Edit Data Siswa';
  document.getElementById('student-form').dataset.editId = student.id;
  document.getElementById('form-nis').value = student.nis;
  document.getElementById('form-name').value = student.name;
  document.getElementById('form-class').value = student.class;
  document.getElementById('form-gender').value = student.gender;
  document.getElementById('form-phone').value = student.phone || '';
  document.getElementById('form-year').value = student.joinYear || new Date().getFullYear();
  document.getElementById('student-modal').classList.add('active');
  closeModal('student-detail-modal'); // Close detail modal if open
}

function submitStudentForm() {
  const form = document.getElementById('student-form');
  const editId = form.dataset.editId;
  const student = {
    nis: document.getElementById('form-nis').value.trim(),
    name: document.getElementById('form-name').value.trim(),
    class: document.getElementById('form-class').value,
    gender: document.getElementById('form-gender').value,
    phone: document.getElementById('form-phone').value.trim(),
    joinYear: parseInt(document.getElementById('form-year').value) || new Date().getFullYear(),
  };

  if (!student.nis || !student.name || !student.class) {
    Utils.showToast('NIS, Nama, dan Kelas wajib diisi', 'error');
    return;
  }

  if (editId) {
    DataManager.updateStudent(editId, student);
    Utils.showToast('Data siswa diperbarui', 'success');
  } else {
    DataManager.addStudent(student);
    Utils.showToast('Siswa berhasil ditambahkan', 'success');
  }

  closeModal('student-modal');
  renderStudents();
}

function openAddBillModal() {
  document.getElementById('bill-form').reset();
  document.getElementById('bill-modal').classList.add('active');
  // populate student select
  const sel = document.getElementById('form-bill-student');
  const students = DataManager.getStudents();
  sel.innerHTML = '<option value="">-- Pilih Siswa --</option>' +
    students.map(s => `<option value="${s.id}">${s.name} (${s.class})</option>`).join('');
}

function submitBillForm() {
  const studentId = document.getElementById('form-bill-student').value;
  const category = document.getElementById('form-bill-category').value;
  const description = document.getElementById('form-bill-desc').value.trim();
  const amount = parseFloat(document.getElementById('form-bill-amount').value) || 0;
  const dueDate = document.getElementById('form-bill-due').value;

  if (!studentId || !category || !description || amount <= 0 || !dueDate) {
    Utils.showToast('Semua field wajib diisi', 'error');
    return;
  }

  DataManager.addBill({ studentId, category, description, amount, dueDate });
  Utils.showToast('Tagihan berhasil ditambahkan', 'success');
  closeModal('bill-modal');
  renderBills();
}

function deleteBill(billId) {
  if (!Utils.confirm('Hapus tagihan ini? Data pembayaran terkait juga akan dihapus.')) return;
  const bills = DataManager.getBills().filter(b => b.id !== billId);
  const payments = DataManager.getPayments().filter(p => p.billId !== billId);
  DataManager.saveBills(bills);
  DataManager.savePayments(payments);
  Utils.showToast('Tagihan dihapus', 'info');
  renderBills();
}

function printPaymentReceipt(paymentId) {
  const payment = DataManager.getPayments().find(p => p.id === paymentId);
  const student = DataManager.getStudents().find(s => s.id === payment?.studentId);
  const bill = DataManager.getBills().find(b => b.id === payment?.billId);
  if (payment && student) Utils.printReceipt(payment, student, bill);
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

function openBulkBillModal() {
  document.getElementById('bulk-bill-modal').classList.add('active');
}

function submitBulkBill() {
  const category = document.getElementById('form-bulk-category').value;
  const description = document.getElementById('form-bulk-desc').value.trim();
  const amount = parseFloat(document.getElementById('form-bulk-amount').value) || 0;
  const dueDate = document.getElementById('form-bulk-due').value;
  const classFilter = document.getElementById('form-bulk-class').value;

  if (!category || !description || amount <= 0 || !dueDate) {
    Utils.showToast('Semua field wajib diisi', 'error');
    return;
  }

  let students = DataManager.getStudents();
  if (classFilter !== 'all') students = students.filter(s => s.class === classFilter);

  students.forEach(s => {
    DataManager.addBill({ studentId: s.id, category, description, amount, dueDate });
  });

  Utils.showToast(`${students.length} tagihan berhasil dibuat untuk ${classFilter === 'all' ? 'semua kelas' : classFilter}`, 'success');
  closeModal('bulk-bill-modal');
  renderPage(currentPage);
}

// ====== IMPORT / EXPORT ======
function openImportStudentModal() {
  document.getElementById('import-student-data').value = '';
  document.getElementById('import-student-modal').classList.add('active');
}

function submitImportStudents() {
  const text = document.getElementById('import-student-data').value.trim();
  if (!text) {
    Utils.showToast('Data tidak boleh kosong', 'error');
    return;
  }

  const lines = text.split('\n');
  let count = 0;
  lines.forEach(line => {
    const parts = line.split('\t'); // tab separated from excel
    if (parts.length >= 3) { // minimal NIS, Nama, Kelas
      const student = {
        nis: parts[0].trim(),
        name: parts[1].trim(),
        class: parts[2].trim(),
        gender: parts[3] ? parts[3].trim().toUpperCase() : 'L',
        phone: parts[4] ? parts[4].trim() : '',
        joinYear: parts[5] ? parseInt(parts[5].trim()) || new Date().getFullYear() : new Date().getFullYear()
      };
      DataManager.addStudent(student);
      count++;
    }
  });

  if (count > 0) {
    Utils.showToast(`${count} data siswa berhasil diimpor!`, 'success');
    closeModal('import-student-modal');
    renderStudents();
  } else {
    Utils.showToast('Tidak ada data valid yang diimpor. Pastikan format benar.', 'error');
  }
}

function exportBackupData() {
  const data = {
    students: DataManager.getStudents(),
    bills: DataManager.getBills(),
    payments: DataManager.getPayments(),
    settings: DataManager.getSettings()
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Backup_SPP_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  Utils.showToast('Data berhasil dibackup!', 'success');
}

function importBackupData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.students && data.bills && data.payments) {
        DataManager.saveStudents(data.students);
        DataManager.saveBills(data.bills);
        DataManager.savePayments(data.payments);
        if (data.settings) DataManager.saveSettings(data.settings);
        
        Utils.showToast('Data berhasil di-restore! Memuat ulang...', 'success');
        setTimeout(() => location.reload(), 1500);
      } else {
        Utils.showToast('Format file backup tidak valid.', 'error');
      }
    } catch (err) {
      Utils.showToast('Gagal membaca file backup.', 'error');
    }
  };
  reader.readAsText(file);
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  DataManager.init();

  // Nav click
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.page));
  });

  // Sidebar toggle mobile
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('active');
    });
  });

  // Student search & filter
  const studentSearch = document.getElementById('student-search');
  if (studentSearch) studentSearch.addEventListener('input', Utils.debounce(renderStudents, 200));
  document.getElementById('student-class-filter')?.addEventListener('change', renderStudents);

  // Payment search & filter
  ['pay-search', 'pay-cat-filter', 'pay-status-filter', 'pay-class-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change',
      el.tagName === 'INPUT' ? Utils.debounce(renderPayments, 200) : renderPayments);
  });

  // Bill search & filter
  ['bill-search', 'bill-cat-filter', 'bill-class-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change',
      el.tagName === 'INPUT' ? Utils.debounce(renderBills, 200) : renderBills);
  });

  // Detail modal filter
  ['detail-cat-filter', 'detail-status-filter'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const modal = document.getElementById('student-detail-modal');
      if (modal.dataset.studentId) openStudentDetail(modal.dataset.studentId);
    });
  });

  navigateTo('dashboard');
});
