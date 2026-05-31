import { formatCurrency } from '../utils.js';
import { t } from '../i18n.js';

export function renderAnalyticsContent(orders, menuItems) {
  const today = new Date(); today.setHours(0,0,0,0);
  const last7 = new Date(today); last7.setDate(last7.getDate() - 7);
  const last30 = new Date(today); last30.setDate(last30.getDate() - 30);

  const parseDate = (o) => o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
  const completedOrders = orders.filter(o => o.status === 'completed' || o.total > 0);
  const todayOrders = completedOrders.filter(o => parseDate(o) >= today);
  const week = completedOrders.filter(o => parseDate(o) >= last7);
  const month = completedOrders.filter(o => parseDate(o) >= last30);

  const todayRev = todayOrders.reduce((s,o) => s + (o.total||0), 0);
  const weekRev = week.reduce((s,o) => s + (o.total||0), 0);
  const monthRev = month.reduce((s,o) => s + (o.total||0), 0);
  const avgOrder = completedOrders.length > 0 ? completedOrders.reduce((s,o) => s + (o.total||0), 0) / completedOrders.length : 0;

  // Maliyet & Net Kar Hesaplamaları
  const todayCost = todayOrders.reduce((s,o) => s + (o.totalCost || 0), 0);
  const todayProfit = todayOrders.reduce((s,o) => s + (o.totalProfit || 0), 0);

  const weekCost = week.reduce((s,o) => s + (o.totalCost || 0), 0);
  const weekProfit = week.reduce((s,o) => s + (o.totalProfit || 0), 0);

  const monthCost = month.reduce((s,o) => s + (o.totalCost || 0), 0);
  const monthProfit = month.reduce((s,o) => s + (o.totalProfit || 0), 0);

  // Top 10 Best Sellers
  const itemCounts = {};
  completedOrders.forEach(o => {
    (o.items || []).forEach(i => {
      if (!itemCounts[i.name]) itemCounts[i.name] = { qty: 0, rev: 0 };
      itemCounts[i.name].qty += i.qty;
      itemCounts[i.name].rev += i.price * i.qty;
    });
  });
  const topItems = Object.entries(itemCounts).sort((a,b) => b[1].qty - a[1].qty).slice(0, 10);
  const maxQty = topItems.length > 0 ? topItems[0][1].qty : 1;

  // Hourly Heatmap (0-23)
  const hourData = new Array(24).fill(0);
  completedOrders.forEach(o => {
    const h = parseDate(o).getHours();
    hourData[h]++;
  });
  const maxHour = Math.max(...hourData, 1);

  // Daily revenue for last 7 days
  const dailyRev = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayEnd = new Date(d); dayEnd.setHours(23,59,59,999);
    const dayOrders = completedOrders.filter(o => { const od = parseDate(o); return od >= d && od <= dayEnd; });
    const rev = dayOrders.reduce((s,o) => s + (o.total||0), 0);
    dailyRev.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), rev });
  }
  const maxDayRev = Math.max(...dailyRev.map(d => d.rev), 1);

  // Günlük net kar trendi (Son 7 gün)
  const dailyProfit = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayEnd = new Date(d); dayEnd.setHours(23,59,59,999);
    const dayOrders = completedOrders.filter(o => { const od = parseDate(o); return od >= d && od <= dayEnd; });
    const profit = dayOrders.reduce((s,o) => s + (o.totalProfit || 0), 0);
    dailyProfit.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), profit });
  }
  const maxDayProfit = Math.max(...dailyProfit.map(d => d.profit), 1);

  // Ürün bazlı kar/maliyet kırılımı (Top 5 en karlı / en az karlı)
  const productProfitData = {};
  completedOrders.forEach(o => {
    (o.items || []).forEach(i => {
      if (!productProfitData[i.name]) {
        productProfitData[i.name] = { qty: 0, revenue: 0, cost: 0, profit: 0 };
      }
      const cost = i.costAtOrderTime !== undefined && i.costAtOrderTime !== null ? i.costAtOrderTime : 0;
      const profit = i.profitAtOrderTime !== undefined && i.profitAtOrderTime !== null ? i.profitAtOrderTime : Math.max(0, i.price - cost);
      
      productProfitData[i.name].qty += i.qty;
      productProfitData[i.name].revenue += i.price * i.qty;
      productProfitData[i.name].cost += cost * i.qty;
      productProfitData[i.name].profit += profit * i.qty;
    });
  });

  const soldProducts = Object.entries(productProfitData).map(([name, data]) => {
    const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    return { name, ...data, marginPercent: margin };
  });

  const topProfitable = [...soldProducts].sort((a,b) => b.profit - a.profit).slice(0, 5);
  const maxProfitVal = topProfitable.length > 0 ? topProfitable[0].profit : 1;

  const leastProfitable = [...soldProducts].filter(p => p.cost > 0).sort((a,b) => a.marginPercent - b.marginPercent).slice(0, 5);

  // Category breakdown
  const catRev = {};
  completedOrders.forEach(o => {
    (o.items || []).forEach(i => {
      const item = menuItems.find(m => m.name === i.name);
      const cat = item?.category || 'Other';
      catRev[cat] = (catRev[cat] || 0) + i.price * i.qty;
    });
  });
  const catEntries = Object.entries(catRev).sort((a,b) => b[1] - a[1]);
  const totalCatRev = catEntries.reduce((s,c) => s + c[1], 0) || 1;
  const catColors = ['#6C5CE7', '#FF6B6B', '#00B894', '#FDCB6E', '#0984E3', '#E84393', '#00CEC9', '#FAB1A0'];

  // Payment method breakdown
  const paymentMethods = { cash: 0, pos: 0, online: 0, split: 0 };
  completedOrders.forEach(o => {
    const method = o.paymentMethod || 'cash';
    paymentMethods[method] = (paymentMethods[method] || 0) + (o.total || 0);
  });

  // Tips stats
  const totalTips = completedOrders.reduce((s,o) => s + (o.tip || 0), 0);
  const avgTip = completedOrders.filter(o => o.tip > 0).length > 0 
    ? totalTips / completedOrders.filter(o => o.tip > 0).length : 0;

  return `
    <div class="analytics-section">
      <!-- Ciro ve Sipariş Özet Kartları -->
      <div class="analytics-summary">
        <div class="analytics-card acard-purple">
          <div class="acard-icon"><span class="material-icons-round">today</span></div>
          <div class="acard-info">
            <span class="acard-label">${t('today', 'admin')} Ciro</span>
            <span class="acard-value">${formatCurrency(todayRev)}</span>
            <span class="acard-sub">${todayOrders.length} ${t('orderCount', 'admin')}</span>
          </div>
        </div>
        <div class="analytics-card acard-blue">
          <div class="acard-icon"><span class="material-icons-round">date_range</span></div>
          <div class="acard-info">
            <span class="acard-label">${t('thisWeek', 'admin')} Ciro</span>
            <span class="acard-value">${formatCurrency(weekRev)}</span>
            <span class="acard-sub">${week.length} ${t('orderCount', 'admin')}</span>
          </div>
        </div>
        <div class="analytics-card acard-green">
          <div class="acard-icon"><span class="material-icons-round">calendar_month</span></div>
          <div class="acard-info">
            <span class="acard-label">${t('thisMonth', 'admin')} Ciro</span>
            <span class="acard-value">${formatCurrency(monthRev)}</span>
            <span class="acard-sub">${month.length} ${t('orderCount', 'admin')}</span>
          </div>
        </div>
        <div class="analytics-card acard-gold">
          <div class="acard-icon"><span class="material-icons-round">trending_up</span></div>
          <div class="acard-info">
            <span class="acard-label">${t('avgOrderAmount', 'admin')}</span>
            <span class="acard-value">${formatCurrency(avgOrder)}</span>
            <span class="acard-sub">${completedOrders.length} ${t('totalLabel', 'admin')}</span>
          </div>
        </div>
      </div>

      <!-- Kar & Maliyet Özet Kartları -->
      <h3 style="margin: 24px 0 12px; font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
        <span class="material-icons-round" style="color: var(--success);">payments</span>
        Maliyet & Net Kar Analizi
      </h3>
      <div class="analytics-summary" style="margin-bottom: 24px;">
        <div class="analytics-card" style="background: linear-gradient(135deg, rgba(0, 184, 148, 0.1), rgba(0, 184, 148, 0.02)); border: 1px solid rgba(0, 184, 148, 0.2);">
          <div class="acard-icon" style="background: rgba(0, 184, 148, 0.15); color: var(--success);"><span class="material-icons-round">paid</span></div>
          <div class="acard-info">
            <span class="acard-label" style="color: var(--text-secondary);">Bugün Net Kar</span>
            <span class="acard-value" style="color: var(--success); font-weight:800;">${formatCurrency(todayProfit)}</span>
            <span class="acard-sub" style="color: var(--text-muted);">Maliyet: ${formatCurrency(todayCost)}</span>
          </div>
        </div>
        <div class="analytics-card" style="background: linear-gradient(135deg, rgba(0, 184, 148, 0.1), rgba(0, 184, 148, 0.02)); border: 1px solid rgba(0, 184, 148, 0.2);">
          <div class="acard-icon" style="background: rgba(0, 184, 148, 0.15); color: var(--success);"><span class="material-icons-round">date_range</span></div>
          <div class="acard-info">
            <span class="acard-label" style="color: var(--text-secondary);">Bu Hafta Net Kar</span>
            <span class="acard-value" style="color: var(--success); font-weight:800;">${formatCurrency(weekProfit)}</span>
            <span class="acard-sub" style="color: var(--text-muted);">Maliyet: ${formatCurrency(weekCost)}</span>
          </div>
        </div>
        <div class="analytics-card" style="background: linear-gradient(135deg, rgba(0, 184, 148, 0.1), rgba(0, 184, 148, 0.02)); border: 1px solid rgba(0, 184, 148, 0.2);">
          <div class="acard-icon" style="background: rgba(0, 184, 148, 0.15); color: var(--success);"><span class="material-icons-round">calendar_month</span></div>
          <div class="acard-info">
            <span class="acard-label" style="color: var(--text-secondary);">Bu Ay Net Kar</span>
            <span class="acard-value" style="color: var(--success); font-weight:800;">${formatCurrency(monthProfit)}</span>
            <span class="acard-sub" style="color: var(--text-muted);">Maliyet: ${formatCurrency(monthCost)}</span>
          </div>
        </div>
        <div class="analytics-card" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border);">
          <div class="acard-icon" style="background: rgba(255,255,255,0.05); color: var(--text-primary);"><span class="material-icons-round">percent</span></div>
          <div class="acard-info">
            <span class="acard-label" style="color: var(--text-secondary);">Genel Kar Marjı</span>
            <span class="acard-value" style="color: #fff; font-weight:800;">%${((monthRev - monthCost) > 0 && monthRev > 0) ? ((monthRev - monthCost) / monthRev * 100).toFixed(1) : '0.0'}</span>
            <span class="acard-sub" style="color: var(--text-muted);">Son 30 Günlük Ortalama</span>
          </div>
        </div>
      </div>

      <div class="analytics-grid">
        <!-- Revenue Chart -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">show_chart</span> ${t('weeklyRevenue', 'admin')}</h3>
          <div class="chart-bar-container">
            ${dailyRev.map(d => `
              <div class="chart-bar-wrapper">
                <div class="chart-bar-value">${formatCurrency(d.rev)}</div>
                <div class="chart-bar" style="height: ${Math.max(4, (d.rev / maxDayRev) * 100)}%"></div>
                <div class="chart-bar-label">${d.day}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Günlük Kar Trendi -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">trending_up</span> Günlük Net Kar Trendi (Son 7 Gün)</h3>
          <div class="chart-bar-container">
            ${dailyProfit.map(d => `
              <div class="chart-bar-wrapper">
                <div class="chart-bar-value" style="color:var(--success); font-weight:600;">${formatCurrency(d.profit)}</div>
                <div class="chart-bar" style="height: ${Math.max(4, (d.profit / maxDayProfit) * 100)}%; background: linear-gradient(to top, var(--success), var(--secondary-light));"></div>
                <div class="chart-bar-label">${d.day}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- En Karlı 5 Menü Ürünü -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">military_tech</span> En Karlı 5 Menü Ürünü (Net Kar Tutarı)</h3>
          <div class="top-sellers-list">
            ${topProfitable.length === 0 ? `<p style="color:var(--text-muted);text-align:center;padding:20px;">Henüz satış verisi bulunmuyor.</p>` :
              topProfitable.map((p, i) => `
                <div class="top-seller-row">
                  <span class="top-rank" style="background:rgba(0, 184, 148, 0.15); color:var(--success);">${i + 1}</span>
                  <div class="top-info">
                    <span class="top-name">${p.name}</span>
                    <div class="top-bar-track" style="background: rgba(255,255,255,0.03);">
                      <div class="top-bar-fill" style="width: ${(p.profit / maxProfitVal) * 100}%; background: linear-gradient(to right, var(--success), var(--secondary-light));"></div>
                    </div>
                  </div>
                  <div class="top-stats">
                    <span class="top-qty">${p.qty} Adet</span>
                    <span class="top-rev" style="color: var(--success); font-weight:700;">+${formatCurrency(p.profit)} Kar</span>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>

        <!-- En Düşük Marjlı 5 Menü Ürünü -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">trending_down</span> En Düşük Marjlı 5 Menü Ürünü</h3>
          <div class="top-sellers-list">
            ${leastProfitable.length === 0 ? `<p style="color:var(--text-muted);text-align:center;padding:20px;">Reçeteli ürün satışı bulunmuyor.</p>` :
              leastProfitable.map((p, i) => `
                <div class="top-seller-row">
                  <span class="top-rank" style="background:rgba(255, 118, 117, 0.15); color:var(--danger);">${i + 1}</span>
                  <div class="top-info">
                    <span class="top-name">${p.name}</span>
                    <div class="top-bar-track" style="background: rgba(255,255,255,0.03);">
                      <div class="top-bar-fill" style="width: ${Math.max(5, p.marginPercent)}%; background: linear-gradient(to right, var(--danger), var(--accent-warm));"></div>
                    </div>
                  </div>
                  <div class="top-stats">
                    <span class="top-qty">%${p.marginPercent.toFixed(1)} Marj</span>
                    <span class="top-rev" style="color: var(--text-secondary); font-size:0.8rem;">Maliyet: ${formatCurrency(p.cost / p.qty)}</span>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>

        <!-- Top Sellers -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">emoji_events</span> ${t('topSellers', 'admin')}</h3>
          <div class="top-sellers-list">
            ${topItems.length === 0 ? `<p style="color:var(--text-muted);text-align:center;padding:20px;">${t('noDataYet', 'admin')}</p>` :
              topItems.map(([name, data], i) => `
                <div class="top-seller-row">
                  <span class="top-rank">${i + 1}</span>
                  <div class="top-info">
                    <span class="top-name">${name}</span>
                    <div class="top-bar-track">
                      <div class="top-bar-fill" style="width: ${(data.qty / maxQty) * 100}%"></div>
                    </div>
                  </div>
                  <div class="top-stats">
                    <span class="top-qty">${data.qty} ${t('pieces', 'admin')}</span>
                    <span class="top-rev">${formatCurrency(data.rev)}</span>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>

        <!-- Hourly Heatmap -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">access_time</span> ${t('peakHours', 'admin')}</h3>
          <div class="heatmap-container">
            ${hourData.map((count, h) => {
              const intensity = count / maxHour;
              const color = intensity === 0 ? 'rgba(108,92,231,0.05)' 
                : `rgba(108,92,231,${0.15 + intensity * 0.85})`;
              return `<div class="heatmap-cell" style="background:${color}" title="${h}:00 - ${count} ${t('orderCount', 'admin')}">
                <span class="heatmap-hour">${h}</span>
                ${count > 0 ? `<span class="heatmap-count">${count}</span>` : ''}
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">donut_small</span> ${t('catBreakdown', 'admin')}</h3>
          <div class="category-breakdown">
            ${catEntries.length === 0 ? `<p style="color:var(--text-muted);text-align:center;padding:20px;">${t('noDataYet', 'admin')}</p>` :
              catEntries.map(([cat, rev], i) => {
                const pct = ((rev / totalCatRev) * 100).toFixed(1);
                return `
                  <div class="cat-breakdown-row">
                    <div class="cat-color" style="background:${catColors[i % catColors.length]}"></div>
                    <span class="cat-name">${cat}</span>
                    <div class="cat-bar-track">
                      <div class="cat-bar-fill" style="width:${pct}%;background:${catColors[i % catColors.length]}"></div>
                    </div>
                    <span class="cat-pct">${pct}%</span>
                    <span class="cat-rev">${formatCurrency(rev)}</span>
                  </div>
                `;
              }).join('')}
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">payment</span> ${t('paymentMethods', 'admin')}</h3>
          <div class="payment-breakdown">
            <div class="payment-stat-row">
              <span class="payment-icon-lbl">💵</span><span>${t('cashLabel', 'admin')}</span>
              <span class="payment-val">${formatCurrency(paymentMethods.cash)}</span>
            </div>
            <div class="payment-stat-row">
              <span class="payment-icon-lbl">📲</span><span>${t('creditCardLabel', 'admin')}</span>
              <span class="payment-val">${formatCurrency(paymentMethods.pos)}</span>
            </div>
            <div class="payment-stat-row">
              <span class="payment-icon-lbl">💳</span><span>${t('onlinePosLabel', 'admin')}</span>
              <span class="payment-val">${formatCurrency(paymentMethods.online)}</span>
            </div>
            <div class="payment-stat-row">
              <span class="payment-icon-lbl">✂️</span><span>${t('splitLabel', 'admin')}</span>
              <span class="payment-val">${formatCurrency(paymentMethods.split)}</span>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="analytics-panel">
          <h3><span class="material-icons-round">volunteer_activism</span> ${t('tipStats', 'admin')}</h3>
          <div class="tips-stats">
            <div class="tip-stat-card">
              <span class="tip-label">${t('totalTips', 'admin')}</span>
              <span class="tip-value">${formatCurrency(totalTips)}</span>
            </div>
            <div class="tip-stat-card">
              <span class="tip-label">${t('avgTip', 'admin')}</span>
              <span class="tip-value">${formatCurrency(avgTip)}</span>
            </div>
            <div class="tip-stat-card">
              <span class="tip-label">${t('tippedOrders', 'admin')}</span>
              <span class="tip-value">${completedOrders.filter(o => o.tip > 0).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
