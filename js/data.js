// ===================================================
// DATA MANAGEMENT MODULE
// Ponpes Al Muttaqin - Aplikasi Keuangan
// ===================================================

const DB_KEYS = {
  STUDENTS: 'spp_students_v3',
  PAYMENTS: 'spp_payments_v3',
  BILLS: 'spp_bills_v3',
  SETTINGS: 'spp_settings_v3',
  CATEGORIES: 'spp_categories_v3',
};

// ---- KATEGORI KEUANGAN ----
const DEFAULT_CATEGORIES = [
  { id: 'spp', name: 'SPP', icon: '🎓', color: '#6366f1', type: 'bulanan' },
  { id: 'buku', name: 'Uang Buku', icon: '📚', color: '#f59e0b', type: 'semester' },
  { id: 'seragam', name: 'Seragam', icon: '👕', color: '#10b981', type: 'tahunan' },
  { id: 'cicilan', name: 'Cicilan', icon: '💳', color: '#ef4444', type: 'cicilan' },
  { id: 'makan', name: 'Uang Makan', icon: '🍱', color: '#f97316', type: 'bulanan' },
  { id: 'kegiatan', name: 'Kegiatan', icon: '⚽', color: '#8b5cf6', type: 'insidental' },
  { id: 'lainnya', name: 'Lainnya', icon: '📋', color: '#64748b', type: 'insidental' },
];

const CLASSES = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const PAYMENT_STATUS = {
  PAID: 'lunas',
  PARTIAL: 'cicilan',
  UNPAID: 'belum',
};

// ---- SAMPLE DATA ----
const SAMPLE_STUDENTS = [
  { id: 's001', nis: '2024001', name: 'Ahmad Fauzan', class: 'I', gender: 'L', phone: '081234567890', joinYear: 2024 },
];

function generateSampleBills() {
  return [];
}

function generateSamplePayments(bills) {
  return [];
}

// ---- DATA ACCESS LAYER ----
const DataManager = {
  init() {
    if (!localStorage.getItem(DB_KEYS.CATEGORIES)) {
      localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(DB_KEYS.STUDENTS)) {
      const bills = generateSampleBills();
      const payments = generateSamplePayments(bills);
      localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(SAMPLE_STUDENTS));
      localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(bills));
      localStorage.setItem(DB_KEYS.PAYMENTS, JSON.stringify(payments));
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify({
        schoolName: 'Ponpes Al Muttaqin',
        sppAmount: 150000,
        academicYear: '2024/2025',
        defaultCategoryAmounts: {
          '2024/2025': {
            spp: 150000,
            buku: 100000,
            seragam: 250000,
            cicilan: 0,
            makan: 75000,
            kegiatan: 50000,
            lainnya: 0,
          },
        },
        academicConfigs: {
          '2024/2025': {
            uniform: {
              L: 250000,
              P: 270000,
            },
            uniformDetails: 'Seragam SDIT terdiri dari baju putih biru, celana/pelengkap, dan badge sekolah.',
            bookPrices: {
              I: 95000,
              II: 100000,
              III: 110000,
              IV: 120000,
              V: 130000,
              VI: 140000,
            },
          },
        },
      }));
    }

    const savedSettings = JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || '{}');
    if (!savedSettings.academicYear) savedSettings.academicYear = '2024/2025';
    if (!savedSettings.defaultCategoryAmounts) savedSettings.defaultCategoryAmounts = { [savedSettings.academicYear]: {} };
    if (!savedSettings.academicConfigs) savedSettings.academicConfigs = { [savedSettings.academicYear]: {
      uniform: { L: 250000, P: 270000 },
      uniformDetails: 'Seragam SDIT terdiri dari baju putih biru, celana/pelengkap, dan badge sekolah.',
      bookPrices: { I: 95000, II: 100000, III: 110000, IV: 120000, V: 130000, VI: 140000 },
    }};
    if (!savedSettings.academicConfigs[savedSettings.academicYear]) {
      savedSettings.academicConfigs[savedSettings.academicYear] = {
        uniform: { L: 250000, P: 270000 },
        uniformDetails: 'Seragam SDIT terdiri dari baju putih biru, celana/pelengkap, dan badge sekolah.',
        bookPrices: { I: 95000, II: 100000, III: 110000, IV: 120000, V: 130000, VI: 140000 },
      };
    }
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(savedSettings));
  },

  getStudents() { return JSON.parse(localStorage.getItem(DB_KEYS.STUDENTS) || '[]'); },
  getBills() { return JSON.parse(localStorage.getItem(DB_KEYS.BILLS) || '[]'); },
  getPayments() { return JSON.parse(localStorage.getItem(DB_KEYS.PAYMENTS) || '[]'); },
  getSettings() { return JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || '{}'); },
  getCategories() { return JSON.parse(localStorage.getItem(DB_KEYS.CATEGORIES) || '[]'); },

  saveStudents(data) { localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(data)); },
  saveBills(data) { localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(data)); },
  savePayments(data) { localStorage.setItem(DB_KEYS.PAYMENTS, JSON.stringify(data)); },
  saveSettings(data) { localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(data)); },
  saveCategories(data) { localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(data)); },

  getDefaultCategoryAmounts(year) {
    const settings = this.getSettings();
    return (settings.defaultCategoryAmounts || {})[year] || {};
  },

  getCategoryDefaultAmount(categoryId, year) {
    const amounts = this.getDefaultCategoryAmounts(year);
    return amounts[categoryId] || 0;
  },

  getAcademicYears() {
    const settings = this.getSettings();
    return Object.keys(settings.defaultCategoryAmounts || {}).sort((a, b) => {
      const aYear = parseInt(a.split('/')[0]) || 0;
      const bYear = parseInt(b.split('/')[0]) || 0;
      return aYear - bYear;
    });
  },

  getAcademicYearConfig(year) {
    const settings = this.getSettings();
    const config = (settings.academicConfigs || {})[year];
    return config || {
      uniform: { L: 0, P: 0 },
      uniformDetails: '',
      bookPrices: { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 },
    };
  },

  setAcademicYearConfig(year, config) {
    const settings = this.getSettings();
    if (!settings.academicConfigs) settings.academicConfigs = {};
    settings.academicConfigs[year] = config;
    this.saveSettings(settings);
  },

  ensureAcademicYear(year) {
    const settings = this.getSettings();
    if (!settings.defaultCategoryAmounts) settings.defaultCategoryAmounts = {};
    if (!settings.defaultCategoryAmounts[year]) settings.defaultCategoryAmounts[year] = {};
    if (!settings.academicConfigs) settings.academicConfigs = {};
    if (!settings.academicConfigs[year]) {
      settings.academicConfigs[year] = {
        uniform: { L: 0, P: 0 },
        uniformDetails: '',
        bookPrices: { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 },
      };
    }
    if (!settings.academicYear) settings.academicYear = year;
    this.saveSettings(settings);
    return settings;
  },

  setAcademicYear(year) {
    const settings = this.getSettings();
    if (!settings.defaultCategoryAmounts) settings.defaultCategoryAmounts = {};
    if (!settings.defaultCategoryAmounts[year]) settings.defaultCategoryAmounts[year] = {};
    if (!settings.academicConfigs) settings.academicConfigs = {};
    if (!settings.academicConfigs[year]) {
      settings.academicConfigs[year] = {
        uniform: { L: 0, P: 0 },
        uniformDetails: '',
        bookPrices: { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 },
      };
    }
    settings.academicYear = year;
    this.saveSettings(settings);
    return settings;
  },

  setCategoryDefaultAmount(categoryId, amount, year) {
    const settings = this.getSettings();
    if (!settings.defaultCategoryAmounts) settings.defaultCategoryAmounts = {};
    if (!settings.defaultCategoryAmounts[year]) settings.defaultCategoryAmounts[year] = {};
    settings.defaultCategoryAmounts[year][categoryId] = amount;
    this.saveSettings(settings);
  },

  getUniformPrice(gender, year) {
    const config = this.getAcademicYearConfig(year);
    return config.uniform?.[gender] || 0;
  },

  getUniformDetails(year) {
    const config = this.getAcademicYearConfig(year);
    return config.uniformDetails || '';
  },

  getBookPriceByClass(cls, year) {
    const config = this.getAcademicYearConfig(year);
    return config.bookPrices?.[cls] || 0;
  },

  duplicateCategoryAmounts(sourceYear, targetYear) {
    const settings = this.getSettings();
    if (!settings.defaultCategoryAmounts) settings.defaultCategoryAmounts = {};
    const source = settings.defaultCategoryAmounts[sourceYear] || {};
    settings.defaultCategoryAmounts[targetYear] = { ...source };
    if (!settings.academicConfigs) settings.academicConfigs = {};
    if (settings.academicConfigs[sourceYear]) {
      settings.academicConfigs[targetYear] = { ...settings.academicConfigs[sourceYear] };
    }
    this.saveSettings(settings);
  },

  addCategory(category) {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  },
  
  updateCategory(id, data) {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx !== -1) { categories[idx] = { ...categories[idx], ...data }; this.saveCategories(categories); }
  },

  deleteCategory(id) {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(categories);
  },

  addStudent(student) {
    const students = this.getStudents();
    student.id = 's' + Date.now();
    student.academicHistory = student.academicHistory || {};
    const currentYear = this.getSettings().academicYear || '2024/2025';
    if (!student.academicHistory[currentYear]) {
      student.academicHistory[currentYear] = {
        class: student.class,
        kbmStartDate: student.kbmStartDate || null,
      };
    }
    students.push(student);
    this.saveStudents(students);
    return student;
  },

  updateStudent(id, data) {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) { students[idx] = { ...students[idx], ...data }; this.saveStudents(students); }
  },

  deleteStudent(id) {
    const students = this.getStudents().filter(s => s.id !== id);
    this.saveStudents(students);
  },

  addBill(bill) {
    const bills = this.getBills();
    bill.id = 'b' + Date.now();
    bill.createdAt = new Date().toISOString();
    bills.push(bill);
    this.saveBills(bills);
    // Create payment record
    const payments = this.getPayments();
    payments.push({
      id: 'p' + Date.now(),
      billId: bill.id,
      studentId: bill.studentId,
      category: bill.category,
      amount: bill.amount,
      paidAmount: 0,
      status: PAYMENT_STATUS.UNPAID,
      paymentDate: null,
      paymentMethod: null,
      notes: '',
      receiptNo: null,
      createdAt: new Date().toISOString(),
    });
    this.savePayments(payments);
    return bill;
  },

  updatePayment(paymentId, paidAmount, method, notes) {
    const payments = this.getPayments();
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx !== -1) {
      const p = payments[idx];
      const totalPaid = p.paidAmount + paidAmount;
      p.paidAmount = Math.min(totalPaid, p.amount);
      p.status = p.paidAmount >= p.amount ? PAYMENT_STATUS.PAID : (p.paidAmount > 0 ? PAYMENT_STATUS.PARTIAL : PAYMENT_STATUS.UNPAID);
      p.paymentDate = new Date().toISOString().split('T')[0];
      p.paymentMethod = method;
      p.notes = notes;
      if (!p.receiptNo) p.receiptNo = 'RCP-' + Date.now();
      this.savePayments(payments);
    }
  },

  getStudentPaymentSummary(studentId) {
    const payments = this.getPayments().filter(p => p.studentId === studentId);
    const totalBilled = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    return { totalBilled, totalPaid, totalUnpaid: totalBilled - totalPaid, payments };
  },

  getStats() {
    const payments = this.getPayments();
    const totalBilled = payments.reduce((s, p) => s + p.amount, 0);
    const totalPaid = payments.reduce((s, p) => s + p.paidAmount, 0);
    const totalUnpaid = totalBilled - totalPaid;
    const countPaid = payments.filter(p => p.status === PAYMENT_STATUS.PAID).length;
    const countPartial = payments.filter(p => p.status === PAYMENT_STATUS.PARTIAL).length;
    const countUnpaid = payments.filter(p => p.status === PAYMENT_STATUS.UNPAID).length;

    const byCategory = {};
    const categories = this.getCategories();
    categories.forEach(cat => {
      const catPayments = payments.filter(p => p.category === cat.id);
      byCategory[cat.id] = {
        billed: catPayments.reduce((s, p) => s + p.amount, 0),
        paid: catPayments.reduce((s, p) => s + p.paidAmount, 0),
      };
    });

    return { totalBilled, totalPaid, totalUnpaid, countPaid, countPartial, countUnpaid, byCategory };
  },

  generateReceiptNo() {
    return 'RCP-' + Date.now();
  },
};
