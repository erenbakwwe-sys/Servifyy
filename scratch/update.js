const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/affiliate.html');
let content = fs.readFileSync(filePath, 'utf8');

// Replace PAKETE
content = content.replace(
  /<div class="section-label reveal">\s*<span class="material-icons-round" style="font-size:0.9rem;">inventory_2<\/span>\s*Produkte\s*<\/div>/,
  `<div class="section-label reveal" data-i18n-html="prod_label">\n          <span class="material-icons-round" style="font-size:0.9rem;">inventory_2</span>\n          Produkte\n        </div>`
);
content = content.replace(
  /<h2 class="section-title reveal reveal-delay-1">Die drei Servify-<span class="gradient-text">Pakete<\/span><\/h2>/,
  `<h2 class="section-title reveal reveal-delay-1" data-i18n-html="prod_title">Die drei Servify-<span class="gradient-text">Pakete</span></h2>`
);
// STARTER
content = content.replace(/<div class="pricing-period">pro Jahr<\/div>/g, `<div class="pricing-period" data-i18n="prod_period">pro Jahr</div>`);
content = content.replace(/Bequem in Raten via Klarna/g, `<span data-i18n="prod_klarna">Bequem in Raten via Klarna</span>`);
content = content.replace(/<div class="pricing-subtitle">Ideal für Einsteiger<\/div>/, `<div class="pricing-subtitle" data-i18n="prod_s_sub">Ideal für Einsteiger</div>`);
// PRO
content = content.replace(/<div class="pricing-badge">Beliebt<\/div>/, `<div class="pricing-badge" data-i18n="prod_badge">Beliebt</div>`);
content = content.replace(/<div class="pricing-subtitle">Für wachsende Betriebe<\/div>/, `<div class="pricing-subtitle" data-i18n="prod_p_sub">Für wachsende Betriebe</div>`);
content = content.replace(/<div class="pricing-inherit">Alles aus Starter, plus:<\/div>/, `<div class="pricing-inherit" data-i18n="prod_p_inh">Alles aus Starter, plus:</div>`);
// ENT
content = content.replace(/<div class="pricing-subtitle">Maximale Power<\/div>/, `<div class="pricing-subtitle" data-i18n="prod_e_sub">Maximale Power</div>`);
content = content.replace(/<div class="pricing-inherit">Alles aus Professional, plus:<\/div>/, `<div class="pricing-inherit" data-i18n="prod_e_inh">Alles aus Professional, plus:</div>`);

// features
content = content.replace(/Dashboard \(Basis\)/, `<span data-i18n="feat_dash">Dashboard (Basis)</span>`);
content = content.replace(/Tische &amp; QR-Bestellung/g, `<span data-i18n="feat_qr">Tische &amp; QR-Bestellung</span>`);
content = content.replace(/Tische & QR-Bestellung/g, `<span data-i18n="feat_qr">Tische & QR-Bestellung</span>`);
content = content.replace(/Speisekarte \(Basis\)/, `<span data-i18n="feat_menu">Speisekarte (Basis)</span>`);
content = content.replace(/Kellner-Ruf-System/, `<span data-i18n="feat_waiter">Kellner-Ruf-System</span>`);
content = content.replace(/Verlauf \(30 Tage\)/, `<span data-i18n="feat_hist30">Verlauf (30 Tage)</span>`);
content = content.replace(/1 Filiale/, `<span data-i18n="feat_1branch">1 Filiale</span>`);
content = content.replace(/Erweitertes Dashboard/, `<span data-i18n="feat_adv_dash">Erweitertes Dashboard</span>`);
content = content.replace(/POS &amp; Kassensystem/g, `<span data-i18n="feat_pos">POS &amp; Kassensystem</span>`);
content = content.replace(/POS & Kassensystem/g, `<span data-i18n="feat_pos">POS & Kassensystem</span>`);
content = content.replace(/Lagerbestandsverwaltung/, `<span data-i18n="feat_inv">Lagerbestandsverwaltung</span>`);
content = content.replace(/Finanzberichte \(Basis\)/, `<span data-i18n="feat_fin">Finanzberichte (Basis)</span>`);
content = content.replace(/Personalverwaltung/, `<span data-i18n="feat_staff">Personalverwaltung</span>`);
content = content.replace(/Unbegrenzter Verlauf/, `<span data-i18n="feat_unl_hist">Unbegrenzter Verlauf</span>`);
content = content.replace(/Kampagnen &amp; Leads/g, `<span data-i18n="feat_camp">Kampagnen &amp; Leads</span>`);
content = content.replace(/Kampagnen & Leads/g, `<span data-i18n="feat_camp">Kampagnen & Leads</span>`);
content = content.replace(/Mehrere Filialen/, `<span data-i18n="feat_multi_branch">Mehrere Filialen</span>`);
content = content.replace(/Erw\. Finanzanalyse &amp; Prognosen/g, `<span data-i18n="feat_adv_fin">Erw. Finanzanalyse &amp; Prognosen</span>`);
content = content.replace(/Erw\. Finanzanalyse & Prognosen/g, `<span data-i18n="feat_adv_fin">Erw. Finanzanalyse & Prognosen</span>`);
content = content.replace(/Automatische Lager-Alerts/, `<span data-i18n="feat_stock_alerts">Automatische Lager-Alerts</span>`);
content = content.replace(/Mehrsprachige Speisekarte/, `<span data-i18n="feat_multi_lang">Mehrsprachige Speisekarte</span>`);
content = content.replace(/Priorität 24\/7 Support/, `<span data-i18n="feat_247">Priorität 24/7 Support</span>`);

// KLARNA BOX
content = content.replace(/<h3>Wichtig: Bezahlung über Klarna<\/h3>/, `<h3 data-i18n="k_title">Wichtig: Bezahlung über Klarna</h3>`);
content = content.replace(/<p>\s*Servify wird ausschließlich über Klarna verkauft\. Das bedeutet für den Kunden: Er kann in Raten zahlen, während wir als Anbieter den vollen Betrag sofort von Klarna erhalten\.\s*<\/p>/, `<p data-i18n="k_text">\n            Servify wird ausschließlich über Klarna verkauft. Das bedeutet für den Kunden: Er kann in Raten zahlen, während wir als Anbieter den vollen Betrag sofort von Klarna erhalten.\n          </p>`);
content = content.replace(/Starkes Verkaufsargument – Kunden müssen nicht den vollen Jahresbetrag auf einmal zahlen/, `<span data-i18n="k_l1">Starkes Verkaufsargument – Kunden müssen nicht den vollen Jahresbetrag auf einmal zahlen</span>`);
content = content.replace(/Bequeme Ratenzahlung senkt die Kaufhürde deutlich/, `<span data-i18n="k_l2">Bequeme Ratenzahlung senkt die Kaufhürde deutlich</span>`);
content = content.replace(/Voller Betrag wird sofort an Servify ausgezahlt/, `<span data-i18n="k_l3">Voller Betrag wird sofort an Servify ausgezahlt</span>`);

// VERTRIEBSKANÄLE
content = content.replace(/<div class="section-label reveal">\s*<span class="material-icons-round" style="font-size:0.9rem;">campaign<\/span>\s*Vertriebskanäle\s*<\/div>/, `<div class="section-label reveal" data-i18n-html="chan_label">\n          <span class="material-icons-round" style="font-size:0.9rem;">campaign</span>\n          Vertriebskanäle\n        </div>`);
content = content.replace(/<h2 class="section-title reveal reveal-delay-1">So erreichst du deine <span class="gradient-text">Kunden<\/span><\/h2>/, `<h2 class="section-title reveal reveal-delay-1" data-i18n-html="chan_title">So erreichst du deine <span class="gradient-text">Kunden</span></h2>`);
content = content.replace(/<h3>YouTube &amp; Social Media<\/h3>/, `<h3 data-i18n="chan_c1_t">YouTube &amp; Social Media</h3>`);
content = content.replace(/<h3>YouTube & Social Media<\/h3>/, `<h3 data-i18n="chan_c1_t">YouTube & Social Media</h3>`);
content = content.replace(/<p>Reviews, Tutorials, Instagram &amp; TikTok im Gastro-Niche\.<\/p>/, `<p data-i18n="chan_c1_p">Reviews, Tutorials, Instagram &amp; TikTok im Gastro-Niche.</p>`);
content = content.replace(/<p>Reviews, Tutorials, Instagram & TikTok im Gastro-Niche\.<\/p>/, `<p data-i18n="chan_c1_p">Reviews, Tutorials, Instagram & TikTok im Gastro-Niche.</p>`);
content = content.replace(/<h3>Blog &amp; SEO<\/h3>/, `<h3 data-i18n="chan_c2_t">Blog &amp; SEO</h3>`);
content = content.replace(/<h3>Blog & SEO<\/h3>/, `<h3 data-i18n="chan_c2_t">Blog & SEO</h3>`);
content = content.replace(/<p>Fachartikel und Suchmaschinenoptimierung\.<\/p>/, `<p data-i18n="chan_c2_p">Fachartikel und Suchmaschinenoptimierung.</p>`);
content = content.replace(/<h3>Cold Email &amp; LinkedIn<\/h3>/, `<h3 data-i18n="chan_c3_t">Cold Email &amp; LinkedIn</h3>`);
content = content.replace(/<h3>Cold Email & LinkedIn<\/h3>/, `<h3 data-i18n="chan_c3_t">Cold Email & LinkedIn</h3>`);
content = content.replace(/<p>Direkter Outreach an Restaurantbesitzer\.<\/p>/, `<p data-i18n="chan_c3_p">Direkter Outreach an Restaurantbesitzer.</p>`);
content = content.replace(/<h3>Cold Calling &amp; D2D<\/h3>/, `<h3 data-i18n="chan_c4_t">Cold Calling &amp; D2D</h3>`);
content = content.replace(/<h3>Cold Calling & D2D<\/h3>/, `<h3 data-i18n="chan_c4_t">Cold Calling & D2D</h3>`);
content = content.replace(/<p>Anrufen oder persönlich vorbeikommen und demonstrieren\.<\/p>/, `<p data-i18n="chan_c4_p">Anrufen oder persönlich vorbeikommen und demonstrieren.</p>`);

// AFFILIATE-MATERIAL
content = content.replace(/<div class="section-label reveal">\s*<span class="material-icons-round" style="font-size:0.9rem;">folder_open<\/span>\s*Affiliate-Material\s*<\/div>/, `<div class="section-label reveal" data-i18n-html="mat_label">\n          <span class="material-icons-round" style="font-size:0.9rem;">folder_open</span>\n          Affiliate-Material\n        </div>`);
content = content.replace(/<h2 class="section-title reveal reveal-delay-1">Alles, was du <span class="gradient-text">brauchst<\/span><\/h2>/, `<h2 class="section-title reveal reveal-delay-1" data-i18n-html="mat_title">Alles, was du <span class="gradient-text">brauchst</span></h2>`);
content = content.replace(/<h3>Banner &amp; Grafiken<\/h3>/, `<h3 data-i18n="mat_c1_t">Banner &amp; Grafiken</h3>`);
content = content.replace(/<h3>Banner & Grafiken<\/h3>/, `<h3 data-i18n="mat_c1_t">Banner & Grafiken</h3>`);
content = content.replace(/<p>Professionelle Werbemittel für alle Kanäle\.<\/p>/, `<p data-i18n="mat_c1_p">Professionelle Werbemittel für alle Kanäle.</p>`);
content = content.replace(/<h3>Demo-Videos<\/h3>/, `<h3 data-i18n="mat_c2_t">Demo-Videos</h3>`);
content = content.replace(/<p>Produktvideos und Screenshots direkt einsetzbar\.<\/p>/, `<p data-i18n="mat_c2_p">Produktvideos und Screenshots direkt einsetzbar.</p>`);
content = content.replace(/<h3>Dein Affiliate-Link<\/h3>/, `<h3 data-i18n="mat_c3_t">Dein Affiliate-Link</h3>`);
content = content.replace(/<p>Persönlicher Link über das Digistore24-Dashboard\.<\/p>/, `<p data-i18n="mat_c3_p">Persönlicher Link über das Digistore24-Dashboard.</p>`);

// FAQ
content = content.replace(/<div class="section-label reveal">\s*<span class="material-icons-round" style="font-size:0.9rem;">help<\/span>\s*FAQ\s*<\/div>/, `<div class="section-label reveal" data-i18n-html="faq_label">\n          <span class="material-icons-round" style="font-size:0.9rem;">help</span>\n          FAQ\n        </div>`);
content = content.replace(/<h2 class="section-title reveal reveal-delay-1">Häufige <span class="gradient-text">Fragen<\/span><\/h2>/, `<h2 class="section-title reveal reveal-delay-1" data-i18n-html="faq_title">Häufige <span class="gradient-text">Fragen</span></h2>`);

content = content.replace(/Wie funktioniert die Abrechnung\?</, `<span data-i18n="faq_q1">Wie funktioniert die Abrechnung?</span><`);
content = content.replace(/<div class="faq-answer"><p>Automatisch über Digistore24 nach 30 Tagen\.<\/p><\/div>/, `<div class="faq-answer"><p data-i18n="faq_a1">Automatisch über Digistore24 nach 30 Tagen.</p></div>`);
content = content.replace(/Was passiert bei Rückerstattung\?</, `<span data-i18n="faq_q2">Was passiert bei Rückerstattung?</span><`);
content = content.replace(/<div class="faq-answer"><p>Provision wird storniert\.<\/p><\/div>/, `<div class="faq-answer"><p data-i18n="faq_a2">Provision wird storniert.</p></div>`);
content = content.replace(/Kann ich mehrere Produkte bewerben\?</, `<span data-i18n="faq_q3">Kann ich mehrere Produkte bewerben?</span><`);
content = content.replace(/<div class="faq-answer"><p>Ja, alle Servify-Pakete\.<\/p><\/div>/, `<div class="faq-answer"><p data-i18n="faq_a3">Ja, alle Servify-Pakete.</p></div>`);
content = content.replace(/Gibt es Mindestverkäufe\?</, `<span data-i18n="faq_q4">Gibt es Mindestverkäufe?</span><`);
content = content.replace(/<div class="faq-answer"><p>Nein, keine Mindestanzahl\.<\/p><\/div>/, `<div class="faq-answer"><p data-i18n="faq_a4">Nein, keine Mindestanzahl.</p></div>`);
content = content.replace(/Wie lange läuft der Cookie\?</, `<span data-i18n="faq_q5">Wie lange läuft der Cookie?</span><`);
content = content.replace(/<div class="faq-answer"><p>90 Tage nach Klick\.<\/p><\/div>/, `<div class="faq-answer"><p data-i18n="faq_a5">90 Tage nach Klick.</p></div>`);

// KONTAKT
content = content.replace(/<div class="section-label reveal">\s*<span class="material-icons-round" style="font-size:0.9rem;">rocket_launch<\/span>\s*Kontakt\s*<\/div>/, `<div class="section-label reveal" data-i18n-html="cont_label">\n          <span class="material-icons-round" style="font-size:0.9rem;">rocket_launch</span>\n          Kontakt\n        </div>`);
content = content.replace(/<h2 class="section-title reveal reveal-delay-1">Bereit <span class="gradient-text">loszulegen\?<\/span><\/h2>/, `<h2 class="section-title reveal reveal-delay-1" data-i18n-html="cont_title">Bereit <span class="gradient-text">loszulegen?</span></h2>`);
content = content.replace(/<p class="section-subtitle mx-auto reveal reveal-delay-2">\s*Hast du Fragen zum Affiliate-Programm oder Interesse an Co-Marketing\? Wir helfen dir gerne weiter\.\s*<\/p>/, `<p class="section-subtitle mx-auto reveal reveal-delay-2" data-i18n="cont_sub">\n          Hast du Fragen zum Affiliate-Programm oder Interesse an Co-Marketing? Wir helfen dir gerne weiter.\n        </p>`);

content = content.replace(/<p>Direktnachricht möglich<\/p>/, `<p data-i18n="cont_wa">Direktnachricht möglich</p>`);
content = content.replace(/<p>Alle Infos im Dashboard<\/p>/, `<p data-i18n="cont_ds">Alle Infos im Dashboard</p>`);
content = content.replace(/Teile diesen Beitrag mit jemandem, der in der Gastro-Branche aktiv ist – gemeinsam verdienen wir mehr!/, `<span data-i18n="cont_share">Teile diesen Beitrag mit jemandem, der in der Gastro-Branche aktiv ist – gemeinsam verdienen wir mehr!</span>`);

// FOOTER
content = content.replace(/<p>&copy; 2026 Servify – Affiliate-Bereich\. Nur für autorisierte Partner\.<\/p>/, `<p data-i18n="footer_copy">&copy; 2026 Servify – Affiliate-Bereich. Nur für autorisierte Partner.</p>`);

fs.writeFileSync(filePath, content, 'utf8');
