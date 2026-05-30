import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin securely using Environment Variable
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson))
      });
    } else {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set!');
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

// SHA-256 Hashing helper
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
    // Dynamic secure CORS configuration
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://servifyy.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://servifyy.vercel.app');
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    }

    try {
        const { orgCode, username, password } = req.body;

        if (!orgCode || !username || !password) {
            return res.status(400).json({ error: 'Eksik parametreler (Restoran Kodu, Kullanıcı Adı veya Şifre).' });
        }

        if (!admin.apps.length) {
            return res.status(500).json({ error: 'Sunucu hatası: Firebase Admin başlatılamadı.' });
        }

        // Query Firestore collection `users/{orgCode}/staff` where `username == username`
        const staffQuerySnapshot = await admin.firestore()
            .collection('users')
            .doc(orgCode)
            .collection('staff')
            .where('username', '==', username)
            .limit(1)
            .get();

        if (staffQuerySnapshot.empty) {
            return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        const staffDoc = staffQuerySnapshot.docs[0];
        const staffData = staffDoc.data();
        
        // Hash the incoming password to match stored SHA-256 hash (backwards compatible)
        const passHash = hashPassword(password);

        if (staffData.passwordHash !== passHash) {
            return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        if (!staffData.isActive) {
            return res.status(403).json({ error: 'Hesabınız devre dışı bırakılmış. Yöneticinize başvurun.' });
        }

        // Authentication successful - Return secure session info to the client
        return res.status(200).json({
            success: true,
            staffSession: {
                staffId: staffDoc.id,
                username: staffData.username,
                role: staffData.role,
                assignedBranchId: staffData.assignedBranchId || null,
                orgId: orgCode
            }
        });

    } catch (error) {
        console.error('staffLogin error:', error);
        return res.status(500).json({ error: 'Giriş işlemi sırasında sistemsel bir hata oluştu.' });
    }
}
