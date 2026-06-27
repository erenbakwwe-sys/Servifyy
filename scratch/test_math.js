import { calculateMenuItemCost, calculateProfit } from '../src/lib/costCalculator.js';

function runTests() {
  console.log('🧪 MALIYET VE KAR HESAPLAMA MODÜLÜ TESTLERİ BAŞLATILIYOR...\n');

  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(` ✅ PASSED: ${message}`);
      passedTests++;
    } else {
      console.error(` ❌ FAILED: ${message}`);
      failedTests++;
    }
  };

  // ============================================
  // TEST 1: Reçete Maliyeti Hesaplama
  // ============================================
  console.log('--- TEST 1: calculateMenuItemCost ---');
  
  // Boş reçete testi
  const emptyCost = calculateMenuItemCost([], {});
  assert(emptyCost === 0, `Boş reçete maliyeti 0 olmalı (Gelen: ${emptyCost})`);

  // Geçersiz reçete testi
  const invalidCost = calculateMenuItemCost(null, {});
  assert(invalidCost === 0, `Geçersiz reçete maliyeti 0 olmalı (Gelen: ${invalidCost})`);

  // Normal reçete maliyet hesabı
  const mockRecipe = [
    { stockId: 'stock_1', stockName: 'Kahve Çekirdeği', quantityUsed: 18 }, // 18 gram
    { stockId: 'stock_2', stockName: 'Süt', quantityUsed: 150 }            // 150 ml
  ];

  const mockStockMap = {
    'stock_1': { unitCostPerGram: 0.8 }, // 0.8 TL/g
    'stock_2': { unitCostPerGram: 0.05 }  // 0.05 TL/ml
  };

  // Beklenen: (18 * 0.8) + (150 * 0.05) = 14.4 + 7.5 = 21.90 TL
  const calculatedCost = calculateMenuItemCost(mockRecipe, mockStockMap);
  assert(calculatedCost === 21.90, `Birim maliyet doğru hesaplanmalı (Beklenen: 21.90, Gelen: ${calculatedCost})`);

  // ============================================
  // TEST 2: Net Kar ve Kar Marjı Hesaplama
  // ============================================
  console.log('\n--- TEST 2: calculateProfit ---');

  const price = 50.00;
  const cost = 20.00;

  // Beklenen: Kar = 30.00, Marj = (30 / 50) * 100 = 60%
  const profitData = calculateProfit(price, cost);
  assert(profitData.profit === 30.00, `Net kar doğru hesaplanmalı (Beklenen: 30.00, Gelen: ${profitData.profit})`);
  assert(profitData.marginPercent === 60.00, `Kar marjı % doğru hesaplanmalı (Beklenen: 60.00, Gelen: ${profitData.marginPercent})`);

  // Bedava ürün kar testi
  const freeProfit = calculateProfit(0, 0);
  assert(freeProfit.profit === 0 && freeProfit.marginPercent === 0, `Bedava ürün kar ve marjı 0 olmalı`);

  // Zararına satış testi (Maliyet satıştan yüksek)
  const lossProfit = calculateProfit(10, 15);
  assert(lossProfit.profit === -5.00 && lossProfit.marginPercent === -50.00, `Zarar durumunda kar marjı eksi çıkmalı (Gelen Kar: ${lossProfit.profit}, Marj: ${lossProfit.marginPercent}%)`);

  // ============================================
  // ÖZET SONUÇLAR
  // ============================================
  console.log('\n============================================');
  console.log(`📊 TEST SONUÇLARI: ${passedTests} Başarılı | ${failedTests} Başarısız`);
  console.log('============================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log(' 🎉 HARİKA! Bütün matematiksel formüller ve algoritmalar eksiksiz ve %100 doğru çalışıyor!');
  }
}

runTests();
