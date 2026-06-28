import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { 
  getFirestore, 
  doc as fDoc, 
  setDoc as fSetDoc, 
  getDoc as fGetDoc, 
  updateDoc as fUpdateDoc, 
  collection as fCollection, 
  addDoc as fAddDoc, 
  query as fQuery, 
  where as fWhere, 
  orderBy as fOrderBy, 
  onSnapshot as fOnSnapshot, 
  getDocs as fGetDocs, 
  deleteDoc as fDeleteDoc, 
  serverTimestamp as fServerTimestamp, 
  Timestamp as fTimestamp, 
  writeBatch as fWriteBatch, 
  limit as fLimit 
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration - REPLACE with your own config
const firebaseConfig = {
  apiKey: "AIzaSyATYXq3ccp1_YFMqrK6ZfV0rYPCfzl9gw4",
  authDomain: "restoqr-eab8d.firebaseapp.com",
  projectId: "restoqr-eab8d",
  storageBucket: "restoqr-eab8d.firebasestorage.app",
  messagingSenderId: "77432872068",
  appId: "1:77432872068:web:8bf49c90d5dbf3939db6d1",
  measurementId: "G-E989KXKWFZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Mock Database for Demo Mode ---
const mockDb = {
  'users/demo': {
    name: 'Demo Yönetici',
    email: 'demo@servifysaas.com',
    onboardingComplete: true,
    plan: 'premium',
    restaurant: { name: 'Servify Lezzet Dünyası', tableCount: 12 },
    paymentSettings: { provider: 'paytr' }
  },
  'users/demo/privateSettings/keys': {
    provider: 'paytr'
  }
};

const mockCollections = {
  'users/demo/menuItems': [
    { id: 'm1', name: 'Adana Kebap', price: 280, emoji: '🍢', category: 'Kebaplar', description: 'Zırhta çekilmiş kuzu kıyma, özel baharatlarla harmanlanmış köz domates-biber eşliğinde.', available: true, recipe: [{ stockId: 's1', stockName: 'Kuzu Kıyma', quantityUsed: 150 }] },
    { id: 'm2', name: 'Urfa Kebap', price: 270, emoji: '🍢', category: 'Kebaplar', description: 'Baharat sevmeyenler için acısız zırh kıyması kebabı.', available: true },
    { id: 'm3', name: 'Lahmacun', price: 80, emoji: '🍕', category: 'Pideler', description: 'Çıtır fırın hamuru üzerine zırh kıyması, soğan, maydanoz ve sarımsaklı özel harç.', available: true },
    { id: 'm4', name: 'Gavurdağı Salatası', price: 120, emoji: '🥗', category: 'Salatalar', description: 'İnce kıyılmış domates, salatalık, ceviz içi ve özel ekşili nar ekşisi sosu ile.', available: true },
    { id: 'm5', name: 'Künefe', price: 140, emoji: '🧁', category: 'Tatlılar', description: 'Tereyağlı tel kadayıf, Hatay peyniri ve ılık şerbet ile.', available: true, recipe: [{ stockId: 's2', stockName: 'Kadayıf', quantityUsed: 100 }, { stockId: 's3', stockName: 'Künefe Peyniri', quantityUsed: 80 }] },
    { id: 'm6', name: 'Ayran', price: 35, emoji: '🥤', category: 'İçecekler', description: 'Bol köpüklü yayık ayranı.', available: true }
  ],
  'users/demo/orders': [
    { id: 'o1', table: 'Masa 4', status: 'new', createdAt: Date.now() - 60000, items: [{ id: 'm1', name: 'Adana Kebap', qty: 2, price: 280 }, { id: 'm6', name: 'Ayran', qty: 2, price: 35 }], total: 630, notes: 'Acısı bol olsun lütfen.', priority: 'normal' },
    { id: 'o2', table: 'Masa 12', status: 'preparing', createdAt: Date.now() - 300000, items: [{ id: 'm3', name: 'Lahmacun', qty: 4, price: 80 }, { id: 'm6', name: 'Ayran', qty: 4, price: 35 }], total: 460, notes: 'Maydanozlar taze olsun.', priority: 'acil' },
    { id: 'o3', table: 'Masa 2', status: 'completed', createdAt: Date.now() - 1800000, items: [{ id: 'm5', name: 'Künefe', qty: 1, price: 140 }], total: 140, priority: 'normal' }
  ],
  'users/demo/calls': [
    { id: 'c1', tableNo: '5', status: 'active', createdAt: Date.now() - 120000 }
  ],
  'users/demo/stock': [
    { id: 's1', name: 'Kuzu Kıyma', unit: 'gram', totalQuantity: 10000, remainingQuantity: 8200, totalCost: 4000, unitCostPerGram: 0.4 },
    { id: 's2', name: 'Kadayıf', unit: 'gram', totalQuantity: 5000, remainingQuantity: 800, totalCost: 500, unitCostPerGram: 0.1 },
    { id: 's3', name: 'Künefe Peyniri', unit: 'gram', totalQuantity: 3000, remainingQuantity: 2500, totalCost: 900, unitCostPerGram: 0.3 }
  ],
  'users/demo/branches': [
    { id: 'b1', name: 'Merkez Şube', address: 'Alsancak, İzmir', phone: '0232 444 0 444' }
  ],
  'users/demo/staff': [
    { id: 'st1', name: 'Ahmet Yılmaz', role: 'garson', phone: '0555 123 4567' }
  ],
  'users/demo/coupons': [
    { id: 'cp1', code: 'HOŞGELDİN10', discount: 10, type: 'percent', active: true }
  ],
  'users/demo/feedback': [
    { id: 'f1', rating: 5, comment: 'Hizmet çok hızlı, lahmacunlar çıtır çıtırdı!', userName: 'Emin A.', createdAt: Date.now() - 3600000 },
    { id: 'f2', rating: 4, comment: 'Gavurdağı salatasının porsiyonu biraz daha büyük olabilirdi ama tadı harikaydı.', userName: 'Meltem K.', createdAt: Date.now() - 7200000 },
    { id: 'f3', rating: 5, comment: 'Künefe sıcak geldi ve peyniri mükemmel uzuyordu. Servis çok kibar.', userName: 'Ahmet T.', createdAt: Date.now() - 86400000 }
  ],
  'users/demo/tabs': [
    { id: 'tab1', tableNo: 3, status: 'open', waiterName: 'Ahmet', items: [{ name: 'Adana Kebap', price: 280, qty: 2, note: 'Acılı' }, { name: 'Ayran', price: 35, qty: 2, note: '' }], subtotal: 630, discount: { type: 'none', value: 0 }, tip: 0, total: 630, paymentMethod: '', createdAt: Date.now() - 1200000 },
    { id: 'tab2', tableNo: 7, status: 'open', waiterName: 'Ahmet', items: [{ name: 'Lahmacun', price: 80, qty: 3, note: '' }, { name: 'Künefe', price: 140, qty: 1, note: 'Az şerbetli' }], subtotal: 380, discount: { type: 'none', value: 0 }, tip: 0, total: 380, paymentMethod: '', createdAt: Date.now() - 600000 },
    { id: 'tab3', tableNo: 1, status: 'closed', waiterName: 'Ahmet', items: [{ name: 'Gavurdağı Salatası', price: 120, qty: 2, note: '' }, { name: 'Adana Kebap', price: 280, qty: 1, note: '' }], subtotal: 520, discount: { type: 'percent', value: 10 }, tip: 20, total: 488, paymentMethod: 'cash', createdAt: Date.now() - 7200000, closedAt: Date.now() - 3600000 }
  ]
};

// Listeners registry for mock database reactive updates
const listeners = [];
function notifyListeners(path) {
  listeners.forEach(l => {
    if (l.path === path || path.startsWith(l.path)) {
      l.callback();
    }
  });
}

// Custom reference creators
const doc = (databaseOrColRef, ...pathSegments) => {
  let segments = [];
  if (databaseOrColRef && typeof databaseOrColRef.path === 'string') {
    segments = databaseOrColRef.path.split('/').concat(pathSegments);
  } else {
    segments = pathSegments;
  }
  const path = segments.join('/');
  return {
    path,
    id: segments[segments.length - 1],
    parent: { path: segments.slice(0, -1).join('/') },
    _isMock: path.indexOf('demo') !== -1
  };
};

const collection = (databaseOrDocRef, ...pathSegments) => {
  let segments = [];
  if (databaseOrDocRef && typeof databaseOrDocRef.path === 'string') {
    segments = databaseOrDocRef.path.split('/').concat(pathSegments);
  } else {
    segments = pathSegments;
  }
  const path = segments.join('/');
  return {
    path,
    _isMock: path.indexOf('demo') !== -1
  };
};

// Custom query operators
const query = (colRef, ...queryConstraints) => {
  return {
    path: colRef.path,
    _isMock: colRef._isMock,
    constraints: queryConstraints
  };
};
const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });
const where = (field, op, value) => ({ type: 'where', field, op, value });
const limit = (n) => ({ type: 'limit', value: n });

// Helpers to convert to real Firestore objects
const toRealRef = (ref) => {
  if (!ref) return null;
  const segments = ref.path.split('/');
  if (segments.length % 2 === 0) {
    return fDoc(db, ...segments);
  } else {
    return fCollection(db, ...segments);
  }
};

const toRealQuery = (q) => {
  if (!q) return null;
  if (!q.constraints) return toRealRef(q);
  
  const realCol = toRealRef({ path: q.path });
  const realConstraints = q.constraints.map(c => {
    if (c.type === 'orderBy') return fOrderBy(c.field, c.direction);
    if (c.type === 'where') return fWhere(c.field, c.op, c.value);
    if (c.type === 'limit') return fLimit(c.value);
    return null;
  }).filter(Boolean);
  
  return fQuery(realCol, ...realConstraints);
};

// Custom functions intercepting 'demo' path
const getDoc = async (docRef) => {
  if (docRef._isMock) {
    const data = mockDb[docRef.path];
    return {
      exists: () => data !== undefined,
      data: () => data ? JSON.parse(JSON.stringify(data)) : undefined,
      id: docRef.id
    };
  }
  return fGetDoc(toRealRef(docRef));
};

const getDocs = async (queryOrColRef) => {
  const path = queryOrColRef.path;
  if (queryOrColRef._isMock) {
    const items = mockCollections[path] || [];
    const snapshotDocs = items.map(item => ({
      id: item.id,
      data: () => JSON.parse(JSON.stringify(item))
    }));
    return {
      forEach: (callback) => snapshotDocs.forEach(callback),
      size: items.length
    };
  }
  return fGetDocs(toRealQuery(queryOrColRef));
};

const setDoc = async (docRef, data, options) => {
  if (docRef._isMock) {
    if (options && options.merge) {
      mockDb[docRef.path] = { ...(mockDb[docRef.path] || {}), ...data };
    } else {
      mockDb[docRef.path] = data;
    }
    notifyListeners(docRef.path);
    return;
  }
  return fSetDoc(toRealRef(docRef), data, options);
};

const updateDoc = async (docRef, data) => {
  if (docRef._isMock) {
    mockDb[docRef.path] = { ...(mockDb[docRef.path] || {}), ...data };
    notifyListeners(docRef.path);
    
    const parentPath = docRef.parent.path;
    if (mockCollections[parentPath]) {
      const idx = mockCollections[parentPath].findIndex(i => i.id === docRef.id);
      if (idx !== -1) {
        mockCollections[parentPath][idx] = { ...mockCollections[parentPath][idx], ...data };
        notifyListeners(parentPath);
      }
    }
    return;
  }
  return fUpdateDoc(toRealRef(docRef), data);
};

const addDoc = async (colRef, data) => {
  if (colRef._isMock) {
    const id = 'mock_' + Math.random().toString(36).substr(2, 9);
    const docPath = colRef.path + '/' + id;
    const item = { id, ...data };
    
    if (!mockCollections[colRef.path]) {
      mockCollections[colRef.path] = [];
    }
    mockCollections[colRef.path].push(item);
    mockDb[docPath] = item;
    
    notifyListeners(colRef.path);
    return { id, path: docPath };
  }
  return fAddDoc(toRealRef(colRef), data);
};

const deleteDoc = async (docRef) => {
  if (docRef._isMock) {
    delete mockDb[docRef.path];
    const parentPath = docRef.parent.path;
    if (mockCollections[parentPath]) {
      mockCollections[parentPath] = mockCollections[parentPath].filter(i => i.id !== docRef.id);
      notifyListeners(parentPath);
    }
    notifyListeners(docRef.path);
    return;
  }
  return fDeleteDoc(toRealRef(docRef));
};

const onSnapshot = (queryOrColRef, callbackOrObserver) => {
  const path = queryOrColRef.path;
  const callback = typeof callbackOrObserver === 'function' ? callbackOrObserver : callbackOrObserver.next;

  if (queryOrColRef._isMock) {
    const listenerId = Math.random().toString(36).substr(2, 9);
    const trigger = () => {
      const segments = path.split('/');
      if (segments.length % 2 === 0) {
        const data = mockDb[path];
        callback({
          exists: () => data !== undefined,
          data: () => data ? JSON.parse(JSON.stringify(data)) : undefined,
          id: segments[segments.length - 1]
        });
      } else {
        const items = mockCollections[path] || [];
        const snapshotDocs = items.map(item => ({
          id: item.id,
          data: () => JSON.parse(JSON.stringify(item))
        }));
        callback({
          forEach: (cb) => snapshotDocs.forEach(cb),
          size: snapshotDocs.length
        });
      }
    };
    
    listeners.push({ id: listenerId, path, callback: trigger });
    setTimeout(trigger, 0);
    return () => {
      const idx = listeners.findIndex(l => l.id === listenerId);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }
  
  return fOnSnapshot(toRealQuery(queryOrColRef), callbackOrObserver);
};

const writeBatch = () => {
  const updates = [];
  return {
    update: (docRef, data) => {
      updates.push({ docRef, data });
    },
    commit: async () => {
      for (const update of updates) {
        await updateDoc(update.docRef, update.data);
      }
    }
  };
};

const serverTimestamp = () => new Date();
const Timestamp = fTimestamp;

export {
  auth, db, getFunctions, httpsCallable,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification,
  doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, getDocs, deleteDoc, serverTimestamp, Timestamp, writeBatch, limit
};
