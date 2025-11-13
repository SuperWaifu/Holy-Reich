/* ===========================================================
   Holy-Reich • Cotations boursières (HAX30)
   - Barre haute extensible via ⛛, repli au scroll
   - Tableau HAX30 (30 sociétés)
   - Volet latéral d’info sur clic d’entreprise
   - Initialisation aléatoire proche d’une base
   - Tick chaque seconde: petite proba d’update + flash
   - Recalcul des variations + indice HAX30 + métriques
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --------- Utilitaires format -----------
  const fmtPrice = (v, currency = "₶") => `${currency}${v.toFixed(2)}`; // ₶ = Lyre impériale
  const fmtInt = (n) => Intl.NumberFormat('fr-FR').format(Math.round(n));
  const fmtPct = (p) => `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;
  const nowStr = () => new Date().toLocaleTimeString('fr-FR', {hour12:false});

  // --------- Données de base (fictives) -----------
  // 30 sociétés du HAX30
  const COMPANIES = [
    { name:"Groupe Clairval",      					ticker:"CLV", sector:"Transports Infrastructures Équipement Industriel Finance Assurance" ,        base: 212.5, shares: 3483e6, desc:"Clairval, fleuron du HAX30 : discipline, innovation rentable et ancrage impérial. Un conglomérat moteur de modernisation et de prestige." }, // check
    { name:"Groupe Nordacier",      				ticker:"NOA", sector:"Industrie lourde Sidérurgie",    	base: 64.5,  shares: 5540e6,  desc:"Nordacier : le fer et l’acier qui bâtissent l’Empire, de la voie ferrée aux navires, incarnation de la puissance industrielle impériale." }, // check
    { name:"Aether Moteurs",        				ticker:"AEM", sector:"Automobile",     					base: 116.0, shares: 330e6,  desc:"Aether Moteurs : symbole de modernité et de prestige, ses automobiles élégantes et puissantes incarnent l’ascension de la bourgeoisie impériale." }, // check
    { name:"Les Forces Impériales d’Énergie",       ticker:"FIE", sector:"Énergie",        					base: 152.0,  shares: 480e6,  desc:"F.I.E : La flamme du Reich, du foyer à l’usine." }, //check
    { name:"Compagnie Impériale des Courants",  	ticker:"CIC", sector:"Commerce Transport",    			base: 84.0, shares: 3210e6,  desc:"Compagnie Impériale des Courants : maîtresse des mers et des routes, colonne vertébrale du commerce du Reich, portant ses richesses au-delà des frontières." }, // check
    { name:"Edelwynn Agri",       					ticker:"EWA", sector:"Agroalimentaire",					base: 39.0,  shares: 950e6,  desc:"Edelwynn Agri : des champs aux villes, premier groupe agroalimentaire du Holy-Reich, maître des laits et céréales qui nourrissent l’Empire." }, // check
    { name:"Compagnie Alhazred",        			ticker:"AHR", sector:"Coopération stratégique",    		base: 6.0,  shares: 1600e6,  desc:"Ex-Consortium Alhazred, autrefois symbole de la prévalence du commerce sur les tensions politiques, maintenant un rémanent sous tutelle du Holy-reich" }, //check
    { name:"Banque Millium",        				ticker:"BML", sector:"Finance",        					base: 44.0,  shares: 1200e6, desc:"Millium : Gardien du trésor national et garant des principaux capitaux privés, Millium émet la lyre, optimisse sa valeur et finance ceux qui en veulent." }, //check
    { name:"Consortium Aegis",     					ticker:"AGS", sector:"Coopération stratégique",   		base: 56.0,  shares: 680e6,  desc:"Consortium Aegis : Société Binationale pour la Défense et l’Industrie Stratégique." }, //check
    { name:"Melynas Minage",       					ticker:"MLM", sector:"Minier Matières",       			base: 27.5,  shares: 880e6,  desc:"Melynas Minage : Extraction de minerais et métaux rares, de la province aux concessions étrangères." }, //check
	{ name:"Holy Media",           					ticker:"HMD", sector:"Media Divertissement",    		base: 102.5, shares: 265e6,  desc:"Holy-Media : gardien du patrimoine et de la culture impériale, alliant héritage historique et innovation médiatique au service du Holy-Reich." }, // check
    { name:"Ostrometal Defense",   					ticker:"OMD", sector:"Armement Défense",      			base: 152.5, shares: 184e6,  desc:"Ostrométal Défense : héritier des arsenaux impériaux, forge la puissance militaire du Holy-Reich avec des armes fiables, lourdes et stratégiques." }, // check
    { name:"Les Forges d’Argence",   				ticker:"LFA", sector:"Métallurgie Argenterie",    		base: 189.5,  shares: 265e6, desc:"Forges d'Argence : De la pureté du métal naît la force de l’Empire." }, //check
    { name:"Les Celliers d’Eldebran",  				ticker:"CEB", sector:"Boissons",       					base: 25.0,  shares: 860e6,  desc:"Les Celliers d’Edelwynn : héritiers des abbayes, maîtres des caves et distilleries, unissant tradition monastique et rayonnement impérial dans chaque verre." }, // check
    { name:"Maison Helvetra",      					ticker:"HLV", sector:"Textile",        					base: 128.0,  shares: 340e6,  desc:"Maison Helvetra : De la simplicité des foyers à l’éclat des palais, Maison Helvetra habille l’empire, symbole d’élégance et d’identité impériale intemporelle." }, // check
    { name:"Manufacture Chimique de Vélorine",   	ticker:"MCV", sector:"Chimie",         					base: 47.0,  shares: 560e6,  desc:"Vélorine : La matière se plie à la volonté." }, //check
    { name:"Aiguebleue Assurances", 		  		ticker:"ABA", sector:"Assurance",      					base: 52.0,  shares: 580e6,  desc:"Aiguebleue Assurances : héritière des solidarités anciennes, partenaire de l’État, elle protège citoyens et entreprises pour un Reich plus sûr." }, // check
    { name:"Boismont Bois",      					ticker:"BMB", sector:"Exploitation forestière Papier",  base: 27.0,  shares: 610e6,  desc:"Premier exploitant forestier impérial, Boismont Timber allie tradition, durabilité et excellence artisanale dans le travail du bois." }, // check
    { name:"Marvenor Vivres",         				ticker:"MVV", sector:"Agroalimentaire",    				base: 21.0,  shares: 740e6,  desc:"Marvenor Vivres : producteur impérial de la mer et des terres, allie traditions rurales et maîtrise maritime dans l’alimentation populaire." }, // check
    { name:"Maison Arvine",       					ticker:"ARV", sector:"Biens de consommation",        	base: 66.0,  shares: 320e6,  desc:"Maison Arvane, l’art de vivre impérial : mobilier, électroménager et design au service du confort moderne et des traditions." }, // check
    { name:"Hôtels Palatins",      					ticker:"HPA", sector:"Hôtellerie",     					base: 57.0,  shares: 300e6,  desc:"Hôtels Palatins : L’élégance impériale, où que vous séjourniez." }, //check
    { name:"Les Laboratoires Impériaux d’Althéria", ticker:"LIA", sector:"Santé",    						base: 88.0,  shares: 420e6,  desc:"Althéria : La science au service de la lignée et du souffle divin." }, //check
    { name:"Skyline Construction", 					ticker:"SKC", sector:"BTP",            					base: 28.0,  shares: 474e6,  desc:"Skyline Construction : bâtisseur de l’Empire moderne, des gares aux palais, alliant grandeur impériale et innovation urbaine au service de l’avenir." }, // check
    { name:"Relais Impériaux",       		 		ticker:"RLI", sector:"Services postaux Logistique",  	base: 19.5,  shares: 900e6, desc:"Relais Impériaux : du courrier aux colis, des villes aux campagnes, un service fidèle et constant, garantissant la circulation des messages de l’Empire." }, // check
    { name:"Verreries Impériales",     				ticker:"VER", sector:"Manufacture Verre Cristal",    	base: 42.5,  shares: 325e6,  desc:"Verreries Impériales : du vitrage industriel au cristal d’exception, alliant force et éclat, savoir-faire artisanal et puissance manufacturière." }, // check
    { name:"Auralis",    							ticker:"ARL", sector:"Défense Technologie",			    base: 17.0,  shares: 500e6,  desc:"Auralis : Les dômes d’éther" }, //check
    { name:"Ligne d'argent",     					ticker:"LDA", sector:"Outils",         					base: 26.0,  shares: 490e6,  desc:"Ligne d’Argent : des champs aux usines, des mains du paysan à celles de l’ingénieur, l’outil fidèle qui bâtit l’avenir du Saint-Empire." }, // check
    { name:"Velvet Divertissement", 				ticker:"VVD", sector:"Divertissement Hôtellerie",		base: 41.0,  shares: 150e6,  desc:"Velvet Divertissement : cabarets et spectacles exclusifs pour élites, glamour et influence discrète, au cœur des réseaux privés du Holy-Reich." }, // check
    { name:"Crist'Eaux du Lac",       				ticker:"CEL", sector:"Eau & Export",  					base: 23.5,  shares: 520e6,  desc:"Puisées au cœur du Continent, les Eaux du Lac incarnent pureté, raffinement et tradition, du quotidien des familles aux banquets impériaux." }, // check
    { name:"NovaGenics",    	   					ticker:"NVG", sector:"Biotechnologies Santé",    		base: 73.0,  shares: 120e6,  desc:"NovaGenics, l’avenir s’écrit dans vos gènes : santé, performance et longévité, la biotechnologie au service d’un empire plus fort et plus durable." } // check
  ];

  // Actifs hors actions (topbar)
  const NON_EQUITY = {
    fx_LYR_PLU: { label: "Lyre/Plume", base: 0.4700 }, // 1 Lyre -> 0,47 Plume dorée
    gold:       { label: "Or (oz)",    base: 2150.00 },
    silver:     { label: "Argent (oz)",base: 126.20 }
  };

  // --------- États dynamiques -----------
  // Baselines fixes (pour "Variation depuis valeur fixée")
  const baseline = {
    equity: COMPANIES.reduce((acc, c) => (acc[c.ticker] = c.base, acc), {}),
    fx: { "LYR/PLU": NON_EQUITY.fx_LYR_PLU.base },
    metals: { gold: NON_EQUITY.gold.base, silver: NON_EQUITY.silver.base }
  };

  // Valeurs courantes (initialisées autour de la base)
  const state = {
    prices: {},      // ticker -> price
    volumes: {},     // ticker -> volume
    index: { baseLevel: 1000, current: 1000, dayLow: Infinity, dayHigh: -Infinity },
    nonEquity: {
      fx: { "LYR/PLU": NON_EQUITY.fx_LYR_PLU.base },
      gold: NON_EQUITY.gold.base,
      silver: NON_EQUITY.silver.base
    },
  };

  // Init aléatoire autour de la base (±3%), volumes init
  const randAround = (base, pct = 0.03) => base * (1 + (Math.random() * 2 - 1) * pct);
  COMPANIES.forEach(c => {
    state.prices[c.ticker] = randAround(c.base, 0.03);
    state.volumes[c.ticker] = Math.round(200000 + Math.random() * 1500000);
  });
  state.nonEquity.fx["LYR/PLU"] = randAround(baseline.fx["LYR/PLU"], 0.01);
  state.nonEquity.gold = randAround(baseline.metals.gold, 0.01);
  state.nonEquity.silver = randAround(baseline.metals.silver, 0.015);

  // Calcul index: 1000 à la baseline, pondéré par capitalisations (price * shares)
  const baselineCapSum = COMPANIES.reduce((sum, c) => sum + c.base * c.shares, 0);
  const capSum = () => COMPANIES.reduce((sum, c) => sum + state.prices[c.ticker] * c.shares, 0);
  const computeIndex = () => state.index.current = state.index.baseLevel * (capSum() / baselineCapSum);

  // --------- DOM refs -----------
  const tbody = document.getElementById('hax-tbody');
  const hax30El = document.getElementById('hax30');
  const hax30DeltaEl = document.getElementById('hax30-delta');
  const hax30RangeEl = document.getElementById('hax30-range');
  const advancersEl = document.getElementById('advancers');
  const declinersEl = document.getElementById('decliners');
  const topGainerEl = document.getElementById('top-gainer');
  const topLoserEl = document.getElementById('top-loser');
  const lastUpdateEl = document.getElementById('last-update');

  const fxEl = document.getElementById('fx-LYR-PLU');
  const fxDeltaEl = document.getElementById('fx-LYR-PLU-delta');
  const goldEl = document.getElementById('gold');
  const goldDeltaEl = document.getElementById('gold-delta');
  const silverEl = document.getElementById('silver');
  const silverDeltaEl = document.getElementById('silver-delta');

  const expanderBtn = document.getElementById('expander');
  const extraPanel = document.getElementById('topbar-extra');
  const topbar = document.getElementById('topbar');

  const drawer = document.getElementById('drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');
  const dTitle = document.getElementById('drawer-title');
  const dSub = document.getElementById('drawer-subtitle');
  const dPrice = document.getElementById('drawer-price');
  const dChange = document.getElementById('drawer-change');
  const dVol = document.getElementById('drawer-volume');
  const dCap = document.getElementById('drawer-cap');
  const dSector = document.getElementById('drawer-sector');
  const dDesc = document.getElementById('drawer-desc');

  let lastFocusedElement = null;
  let justClickedExpander = false;
  let scrollTimer = null;

  // --------- Rendu du tableau -----------
  function renderTable() {
    const rows = COMPANIES.map(c => {
      const p = state.prices[c.ticker];
      const pct = ((p - baseline.equity[c.ticker]) / baseline.equity[c.ticker]) * 100;
      const vol = state.volumes[c.ticker];

      return `
        <tr data-ticker="${c.ticker}">
          <td><a class="company-link" data-company="${c.ticker}" href="javascript:void(0)">${c.name}</a></td>
          <td>${c.ticker}</td>
          <td class="num price" data-field="price">${fmtPrice(p)}</td>
          <td class="num change ${pct>=0?'up':'down'}" data-field="change">${fmtPct(pct)}</td>
          <td class="num volume" data-field="volume">${fmtInt(vol)}</td>
        </tr>
      `;
    }).join('');
    tbody.innerHTML = rows;
  }

  // --------- Mise à jour cellules avec flash -----------
  function setCell(tr, field, value, flash) {
    const td = tr.querySelector(`[data-field="${field}"]`);
    if (!td) return;
    td.innerHTML = value;
    if (flash) {
      td.classList.remove('flash-up','flash-down');
      // reflow trick
      void td.offsetWidth;
      td.classList.add(flash);
      setTimeout(() => td.classList.remove('flash-up','flash-down'), 1000);
    }
  }

  // --------- Rendu top bar + extra -----------
  function renderTopbar() {
    // HAX30
    computeIndex();
    const idx = state.index.current;
    const idxPct = ((idx - state.index.baseLevel) / state.index.baseLevel) * 100;
    hax30El.textContent = idx.toFixed(2);
    hax30DeltaEl.textContent = `(${fmtPct(idxPct)})`;
    hax30DeltaEl.className = `delta ${idxPct>=0?'up':'down'}`;

    // Range jour
    state.index.dayLow = Math.min(state.index.dayLow, idx);
    state.index.dayHigh = Math.max(state.index.dayHigh, idx);
    hax30RangeEl.textContent = `${state.index.dayLow.toFixed(2)} — ${state.index.dayHigh.toFixed(2)}`;

    // Breadth + tops
    let ups=0, downs=0;
    let best = { t:null, pct:-Infinity }, worst = { t:null, pct:Infinity };
    COMPANIES.forEach(c=>{
      const p = state.prices[c.ticker];
      const pct = ((p - baseline.equity[c.ticker]) / baseline.equity[c.ticker]) * 100;
      if (pct>=0) ups++; else downs++;
      if (pct>best.pct) best={t:c, pct};
      if (pct<worst.pct) worst={t:c, pct};
    });
    advancersEl.textContent = ups;
    declinersEl.textContent = downs;
    topGainerEl.textContent = best.t ? `${best.t.ticker} ${fmtPct(best.pct)}` : '—';
    topLoserEl.textContent = worst.t ? `${worst.t.ticker} ${fmtPct(worst.pct)}` : '—';

    // FX + Métaux
    const fx = state.nonEquity.fx["LYR/PLU"];
    const fxPct = ((fx - baseline.fx["LYR/PLU"]) / baseline.fx["LYR/PLU"]) * 100;
    fxEl.textContent = fx.toFixed(4);
    fxDeltaEl.textContent = `(${fmtPct(fxPct)})`;
    fxDeltaEl.className = `delta ${fxPct>=0?'up':'down'}`;

    const g = state.nonEquity.gold;
    const gPct = ((g - baseline.metals.gold) / baseline.metals.gold) * 100;
    goldEl.textContent = fmtPrice(g, "¤"); // ¤ symbole générique
    goldDeltaEl.textContent = `(${fmtPct(gPct)})`;
    goldDeltaEl.className = `delta ${gPct>=0?'up':'down'}`;

    const s = state.nonEquity.silver;
    const sPct = ((s - baseline.metals.silver) / baseline.metals.silver) * 100;
    silverEl.textContent = fmtPrice(s, "¤");
    silverDeltaEl.textContent = `(${fmtPct(sPct)})`;
    silverDeltaEl.className = `delta ${sPct>=0?'up':'down'}`;

    lastUpdateEl.textContent = `Dernière mise à jour : ${nowStr()}`;
  }

  // --------- Tick: faible chance d’update par actif -----------
  function jitter(price, maxPct=0.005) { // ±0,5%
    const delta = price * (Math.random()*2 - 1) * maxPct;
    return Math.max(0.01, price + delta);
  }

  function tick() {
    // Probas d’update
    const pEquity = 0.18;   // 18% de chance par seconde et par action
    const pFX     = 0.22;
    const pGold   = 0.15;
    const pSilver = 0.17;

    // MAJ actions
    const trs = Array.from(tbody.querySelectorAll('tr'));
    trs.forEach(tr => {
      const ticker = tr.getAttribute('data-ticker');
      if (Math.random() < pEquity) {
        const old = state.prices[ticker];
        const next = jitter(old, 0.004); // ±0,4%/tick
        state.prices[ticker] = next;
        // Volume grimpe légèrement
        state.volumes[ticker] += Math.round(1000 + Math.random()*6000);

        const pct = ((next - baseline.equity[ticker]) / baseline.equity[ticker]) * 100;
        const flashClass = (next>=old) ? 'flash-up' : 'flash-down';

        setCell(tr, 'price', fmtPrice(next), flashClass);
        const changeTd = tr.querySelector('[data-field="change"]');
        changeTd.textContent = fmtPct(pct);
        changeTd.classList.toggle('up', pct>=0);
        changeTd.classList.toggle('down', pct<0);
        changeTd.classList.remove('flash-up','flash-down');
        void changeTd.offsetWidth;
        changeTd.classList.add(flashClass);

        setCell(tr, 'volume', fmtInt(state.volumes[ticker]), flashClass);
      }
    });

    // MAJ non-equity
    if (Math.random() < pFX) {
      const old = state.nonEquity.fx["LYR/PLU"];
      const next = jitter(old, 0.002); // ±0,2%
      state.nonEquity.fx["LYR/PLU"] = next;
      // flash topbar
      fxEl.classList.remove('flash-up','flash-down');
      void fxEl.offsetWidth;
      fxEl.classList.add(next>=old?'flash-up':'flash-down');
    }
    if (Math.random() < pGold) {
      const old = state.nonEquity.gold;
      const next = jitter(old, 0.003);
      state.nonEquity.gold = next;
      goldEl.classList.remove('flash-up','flash-down'); void goldEl.offsetWidth;
      goldEl.classList.add(next>=old?'flash-up':'flash-down');
    }
    if (Math.random() < pSilver) {
      const old = state.nonEquity.silver;
      const next = jitter(old, 0.0035);
      state.nonEquity.silver = next;
      silverEl.classList.remove('flash-up','flash-down'); void silverEl.offsetWidth;
      silverEl.classList.add(next>=old?'flash-up':'flash-down');
    }

    // Recalculs globaux
    renderTopbar();
  }

  // --------- Volet latéral ---------
  function openDrawer(company) {
	lastFocusedElement = document.activeElement;
    drawer.setAttribute('aria-hidden','false');
    dTitle.textContent = `${company.name} (${company.ticker})`;
    dSub.textContent = company.name;
    const p = state.prices[company.ticker];
    const pct = ((p - baseline.equity[company.ticker]) / baseline.equity[company.ticker]) * 100;
    dPrice.textContent = fmtPrice(p);
    dChange.textContent = fmtPct(pct);
    dChange.className = `value ${pct>=0?'up':'down'}`;
    dVol.textContent = fmtInt(state.volumes[company.ticker]);

    const cap = p * company.shares;
    dCap.textContent = `₶${Intl.NumberFormat('fr-FR', {notation:'compact', compactDisplay:'short', maximumFractionDigits:2}).format(cap)}`;
    dSector.textContent = company.sector;
    dDesc.textContent = company.desc;
    // Focus manag.
    setTimeout(()=> drawer.querySelector('.drawer__close').focus(), 0);
  }
  function closeDrawer(){ drawer.setAttribute('aria-hidden','true');
  if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null; // Nettoyer
  }

  // --------- Événements ----------
  // Rendu initial
  renderTable();
  renderTopbar();
  expanderBtn.setAttribute('aria-expanded', 'true');

  // Clic entreprise -> ouvrir volet
  tbody.addEventListener('click', (e) => {
    const a = e.target.closest('[data-company]');
    if (!a) return;
    const ticker = a.getAttribute('data-company');
    const company = COMPANIES.find(c => c.ticker === ticker);
    if (company) openDrawer(company);
  });
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeDrawer(); });

  // Barre haute: expand/collapse
  expanderBtn.addEventListener('click', ()=>{
    const wasExpanded = expanderBtn.getAttribute('aria-expanded') === 'true';
    const isExpanded = !wasExpanded;
    expanderBtn.setAttribute('aria-expanded', String(isExpanded));
    extraPanel.hidden = !isExpanded; // Si on veut ouvrir (isExpanded=true), hidden devient false
	justClickedExpander = true;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      justClickedExpander = false;
    }, 100);
  });
  // Repli au scroll
  window.addEventListener('scroll', ()=>{
	if (justClickedExpander) {
      return;
    }
    if (window.scrollY > 10) {
      // Dès qu'on défile (plus de 10px), on cache
      extraPanel.hidden = true;
	  expanderBtn.setAttribute('aria-expanded', 'false');
    } else {
      // On est revenu TOUT en haut
      // On restaure la visibilité en fonction de l'état du bouton
      const isExpanded = expanderBtn.getAttribute('aria-expanded') === 'true';
      extraPanel.hidden = !isExpanded;
    }
  }, {passive:true});

  // Boucle d’updates
  setInterval(tick, 1000);
});