import { db, doc, getDoc, collection, getDocs, writeBatch } from '../firebase.js';

/**
 * Reçeteden toplam maliyet hesaplar.
 * @param {Array} recipe - [{ stockId, stockName, quantityUsed }]
 * @param {Map|Object} stockMap - Stock ID'leri ile stock verilerini (unitCostPerGram dahil) eşleyen harita
 * @returns {number} Toplam hammadde maliyeti
 */
export function calculateMenuItemCost(recipe, stockMap) {
  if (!recipe || !Array.isArray(recipe) || recipe.length === 0) return 0;
  
  let totalCost = 0;
  recipe.forEach(item => {
    const stockItem = stockMap instanceof Map ? stockMap.get(item.stockId) : stockMap[item.stockId];
    if (stockItem) {
      const unitCost = stockItem.unitCostPerGram || 0;
      totalCost += (item.quantityUsed || 0) * unitCost;
    }
  });
  return parseFloat(totalCost.toFixed(2));
}

/**
 * Kar ve marj hesaplar.
 * @param {number} sellingPrice - Ürünün satış fiyatı
 * @param {number} cost - Ürünün reçete maliyeti
 * @returns {Object} { profit: number, marginPercent: number }
 */
export function calculateProfit(sellingPrice, cost) {
  const profit = sellingPrice - cost;
  const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  return {
    profit: parseFloat(profit.toFixed(2)),
    marginPercent: parseFloat(marginPercent.toFixed(2))
  };
}

/**
 * Sipariş verildiğinde ilgili hammaddelerin kalan miktarlarını düşer.
 * @param {Array} orderItems - Sipariş edilen ürünler [{ id, qty, name }]
 * @param {string} userId - Restoran ID
 * @returns {Promise<void>}
 */
export async function deductStockOnOrder(orderItems, userId) {
  if (!orderItems || orderItems.length === 0 || !userId) return;

  try {
    const batch = writeBatch(db);
    const lowStockAlerts = [];

    for (const item of orderItems) {
      // 1. Her sipariş edilen menü ürününün detayını çek
      const menuDoc = await getDoc(doc(db, 'users', userId, 'menuItems', item.id));
      if (!menuDoc.exists()) continue;
      
      const menuData = menuDoc.data();
      const recipe = menuData.recipe;
      
      // Eğer reçete tanımlıysa stok düşümü yap
      if (recipe && Array.isArray(recipe) && recipe.length > 0) {
        for (const ingredient of recipe) {
          const stockRef = doc(db, 'users', userId, 'stock', ingredient.stockId);
          const stockSnap = await getDoc(stockRef);
          
          if (stockSnap.exists()) {
            const stockData = stockSnap.data();
            const quantityToDeduct = (ingredient.quantityUsed || 0) * (item.qty || 1);
            const currentRemaining = stockData.remainingQuantity || 0;
            const newRemaining = Math.max(0, currentRemaining - quantityToDeduct);
            
            // Batch'e ekle
            batch.update(stockRef, {
              remainingQuantity: newRemaining,
              updatedAt: new Date()
            });

            // Stok 0'a düşerse veya çok azalırsa uyarı listesine ekle
            if (newRemaining <= 0) {
              lowStockAlerts.push(`${ingredient.stockName} Tükendi!`);
            } else if (newRemaining / (stockData.totalQuantity || 1) < 0.20) {
              lowStockAlerts.push(`${ingredient.stockName} Kritik Seviyede (%20 altı)!`);
            }
          }
        }
      }
    }

    // Değişiklikleri kaydet
    await batch.commit();

    // Düşük stok bildirimlerini göster
    if (lowStockAlerts.length > 0) {
      console.warn('Stok Uyarıları:', lowStockAlerts);
    }
  } catch (err) {
    console.error('Stock deduction error:', err);
    throw err;
  }
}
