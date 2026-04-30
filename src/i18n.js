export const translations = {
  tr: {
    dashboard: 'Kontrol Paneli',
    orders: 'Siparişler',
    menu: 'Menü Yönetimi',
    qr: 'QR Kodlar',
    calls: 'Çağrılar',
    branches: 'Şubeler',
    staff: 'Personel',
    aiTheme: 'AI Tema',
    history: 'Geçmiş',
    finance: 'Finans',
    mainMenu: 'Ana Menü',
    management: 'Yönetim',
    design: 'Tasarım',
    reports: 'Raporlar',
    logout: 'Çıkış',
    trialDaysLeft: 'gün kaldı',
    loading: 'Yükleniyor...',
    search: 'Ara...',
    save: 'Kaydet',
    cancel: 'İptal',
    edit: 'Düzenle',
    delete: 'Sil',
    add: 'Ekle',
    newOrder: 'Yeni Sipariş',
    preparing: 'Hazırlanıyor',
    completed: 'Tamamlandı',
    total: 'Toplam',
    revenue: 'Gelir',
    activeCalls: 'Aktif Çağrılar',
    recentOrders: 'Son Siparişler'
  },
  en: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    menu: 'Menu Management',
    qr: 'QR Codes',
    calls: 'Calls',
    branches: 'Branches',
    staff: 'Staff',
    aiTheme: 'AI Theme',
    history: 'History',
    finance: 'Finance',
    mainMenu: 'Main Menu',
    management: 'Management',
    design: 'Design',
    reports: 'Reports',
    logout: 'Logout',
    trialDaysLeft: 'days left',
    loading: 'Loading...',
    search: 'Search...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    newOrder: 'New Order',
    preparing: 'Preparing',
    completed: 'Completed',
    total: 'Total',
    revenue: 'Revenue',
    activeCalls: 'Active Calls',
    recentOrders: 'Recent Orders'
  },
  de: {
    dashboard: 'Dashboard',
    orders: 'Bestellungen',
    menu: 'Menüverwaltung',
    qr: 'QR Codes',
    calls: 'Aufrufe',
    branches: 'Filialen',
    staff: 'Personal',
    aiTheme: 'KI-Design',
    history: 'Verlauf',
    finance: 'Finanzen',
    mainMenu: 'Hauptmenü',
    management: 'Verwaltung',
    design: 'Design',
    reports: 'Berichte',
    logout: 'Abmelden',
    trialDaysLeft: 'Tage übrig',
    loading: 'Wird geladen...',
    search: 'Suchen...',
    save: 'Speichern',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    add: 'Hinzufügen',
    newOrder: 'Neue Bestellung',
    preparing: 'In Vorbereitung',
    completed: 'Abgeschlossen',
    total: 'Gesamt',
    revenue: 'Einnahmen',
    activeCalls: 'Aktive Aufrufe',
    recentOrders: 'Letzte Bestellungen'
  }
};

let currentAdminLang = localStorage.getItem('adminLang') || 'tr';

export function getAdminLang() {
  return currentAdminLang;
}

export function setAdminLang(lang) {
  currentAdminLang = lang;
  localStorage.setItem('adminLang', lang);
}

export function t(key) {
  return translations[currentAdminLang]?.[key] || translations['tr'][key] || key;
}
