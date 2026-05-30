import admin from 'firebase-admin';
import Stripe from 'stripe';
import Iyzipay from 'iyzipay';

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
        const { userId, amount, currency, items, tipAmount, appliedCouponId, returnUrl } = req.body;

        if (!userId || !amount || !items || !returnUrl) {
            return res.status(400).json({ error: 'Eksik parametreler (userId, amount, items, returnUrl).' });
        }

        if (!admin.apps.length) {
            return res.status(500).json({ error: 'Sunucu hatası: Firebase Admin başlatılamadı.' });
        }

        // 1. Fetch user (restaurant) profile from Firestore
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Restoran bulunamadı.' });
        }
        const userData = userDoc.data();

        // 2. Fetch payment settings securely from privateSettings/keys (fallback to public profile for backward compatibility)
        const keysDoc = await admin.firestore().collection('users').doc(userId).collection('privateSettings').doc('keys').get();
        const paymentSettings = keysDoc.exists ? keysDoc.data() : userData.paymentSettings;

        if (!paymentSettings || !paymentSettings.provider || paymentSettings.provider === 'none') {
            return res.status(400).json({ error: 'Bu restoran için online ödeme ayarlanmamış.' });
        }

        const { provider, apiKey, secretKey } = paymentSettings;

        // 3. SERVER-SIDE PRICE AND BASKET VALIDATION (Anti-Price Manipulation)
        let calculatedSubtotal = 0;
        const menuSnapshot = await admin.firestore().collection('users').doc(userId).collection('menuItems').get();
        const menuMap = {};
        menuSnapshot.forEach(doc => {
            const data = doc.data();
            menuMap[doc.id] = Number(data.price) || 0;
        });

        for (const item of items) {
            const truePrice = menuMap[item.id];
            if (truePrice === undefined) {
                return res.status(400).json({ error: `Geçersiz veya yayından kaldırılmış ürün: ${item.name}` });
            }
            // Add to subtotal
            calculatedSubtotal += truePrice * Number(item.qty);
        }

        // 4. SERVER-SIDE COUPON VALIDATION
        let calculatedDiscount = 0;
        if (appliedCouponId) {
            const couponDoc = await admin.firestore().collection('users').doc(userId).collection('coupons').doc(appliedCouponId).get();
            if (couponDoc.exists) {
                const couponData = couponDoc.data();
                const now = new Date();
                const isExpired = couponData.expiresAt && new Date(couponData.expiresAt) < now;
                const isMaxed = couponData.maxUses && couponData.usedCount >= couponData.maxUses;
                const isActive = couponData.active && !isExpired && !isMaxed;
                const passesMinOrder = !couponData.minOrder || calculatedSubtotal >= couponData.minOrder;

                if (isActive && passesMinOrder) {
                    if (couponData.type === 'percent') {
                        calculatedDiscount = calculatedSubtotal * (Number(couponData.value) / 100);
                    } else {
                        calculatedDiscount = Number(couponData.value);
                    }
                    calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);
                }
            }
        }

        // 5. GRAND TOTAL VERIFICATION
        const calculatedTip = Number(tipAmount) || 0;
        const calculatedGrandTotal = Math.max(0, calculatedSubtotal + calculatedTip - calculatedDiscount);

        // Allow up to 0.05 delta for potential floating point/rounding discrepancies
        if (Math.abs(calculatedGrandTotal - Number(amount)) > 0.05) {
            console.error(`Price manipulation alert! Client: ${amount}, Server: ${calculatedGrandTotal}`);
            return res.status(400).json({ error: 'Sepet tutarı doğrulaması başarısız oldu. Fiyatlarda uyuşmazlık var!' });
        }

        // --- PAYMENT GATEWAY ROUTING ---

        if (provider === 'stripe') {
            if (!secretKey) {
                return res.status(400).json({ error: 'Stripe yapılandırması eksik (Secret Key).' });
            }

            const stripe = new Stripe(secretKey);
            
            // Map items using their server-verified prices
            const lineItems = items.map(item => {
                const dbPrice = menuMap[item.id];
                return {
                    price_data: {
                        currency: (currency || 'TRY').toLowerCase(),
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: Math.round(dbPrice * 100), // Minor units
                    },
                    quantity: item.qty,
                };
            });

            // If there's a coupon discount, add it as a negative line item (Stripe supports discounts, but for simplicity we can apply it to line items or as a separate item)
            if (calculatedDiscount > 0) {
                lineItems.push({
                    price_data: {
                        currency: (currency || 'TRY').toLowerCase(),
                        product_data: {
                            name: 'İndirim Kuponu',
                        },
                        unit_amount: -Math.round(calculatedDiscount * 100),
                    },
                    quantity: 1,
                });
            }

            // If there is a tip, add it as a line item
            if (calculatedTip > 0) {
                lineItems.push({
                    price_data: {
                        currency: (currency || 'TRY').toLowerCase(),
                        product_data: {
                            name: 'Bahşiş (Tip)',
                        },
                        unit_amount: Math.round(calculatedTip * 100),
                    },
                    quantity: 1,
                });
            }

            // Create Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${returnUrl}?payment=success&provider=stripe`,
                cancel_url: `${returnUrl}?payment=cancelled`,
            });

            return res.status(200).json({
                paymentUrl: session.url,
                sessionId: session.id,
                provider: 'stripe'
            });

        } else if (provider === 'iyzico') {
            if (!apiKey || !secretKey) {
                return res.status(400).json({ error: 'Iyzico yapılandırması eksik (API veya Secret Key).' });
            }

            const iyzipay = new Iyzipay({
                apiKey: apiKey,
                secretKey: secretKey,
                uri: 'https://api.iyzipay.com' // Use sandbox-api for testing if needed
            });

            const basketItems = items.map(item => {
                const dbPrice = menuMap[item.id];
                return {
                    id: item.id || 'ITEM',
                    name: item.name,
                    category1: 'Food',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price: dbPrice.toString()
                };
            });

            // Adjust basket for tips/coupons if applicable (Iyzico paid price must match basket items sum)
            let adjustedAmount = calculatedGrandTotal;

            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '85.34.78.112';

            const request = {
                locale: Iyzipay.LOCALE.TR,
                conversationId: `ORD-${Date.now()}`,
                price: calculatedSubtotal.toString(),
                paidPrice: adjustedAmount.toString(),
                currency: Iyzipay.CURRENCY.TRY,
                basketId: `BSK-${Date.now()}`,
                paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
                callbackUrl: `${returnUrl}?payment=success&provider=iyzico`,
                enabledInstallments: [2, 3, 6, 9],
                buyer: {
                    id: `BY-${Date.now()}`,
                    name: 'Müşteri',
                    surname: 'Misafir',
                    gsmNumber: '+905000000000',
                    email: 'customer@servifyy.com',
                    identityNumber: '11111111110', // Safe default generic identity number
                    lastLoginDate: '2026-05-30 12:00:00',
                    registrationDate: '2026-05-30 12:00:00',
                    registrationAddress: 'QR Order Customer',
                    ip: clientIp,
                    city: 'Istanbul',
                    country: 'Turkey',
                    zipCode: '34000'
                },
                shippingAddress: {
                    contactName: 'Jane Doe',
                    city: 'Istanbul',
                    country: 'Turkey',
                    address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                    zipCode: '34732'
                },
                billingAddress: {
                    contactName: 'Jane Doe',
                    city: 'Istanbul',
                    country: 'Turkey',
                    address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                    zipCode: '34732'
                },
                basketItems: basketItems
            };

            return new Promise((resolve) => {
                iyzipay.checkoutFormInitialize.create(request, function (err, result) {
                    if (err) {
                        console.error('Iyzico Error:', err);
                        resolve(res.status(500).json({ error: 'Iyzico ödeme işlemi başlatılamadı.' }));
                    } else if (result.status !== 'success') {
                        console.error('Iyzico Failed:', result);
                        resolve(res.status(500).json({ error: result.errorMessage || 'Iyzico ödeme formu alınamadı.' }));
                    } else {
                        resolve(res.status(200).json({
                            paymentUrl: result.paymentPageUrl,
                            sessionId: result.token,
                            provider: 'iyzico'
                        }));
                    }
                });
            });

        } else {
            return res.status(400).json({ error: 'Geçersiz veya desteklenmeyen ödeme sağlayıcısı.' });
        }

    } catch (error) {
        console.error('createPaymentSession error:', error);
        return res.status(500).json({ error: 'Ödeme işlemi başlatılırken sistemsel bir hata oluştu.' });
    }
}
