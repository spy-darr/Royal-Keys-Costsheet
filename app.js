/* ════════════════════════════════════════
   ROYAL KEYS COST SHEET — APP.JS v3
   ════════════════════════════════════════ */

const PASSWORD = 'RoyalKeys@2026';

const RESIDENTIAL_TERMS = [
  'Above-mentioned rates are subject to change without prior notice.',
  'Booking amount: Rs.2,00,000/-.',
  'Government taxes will be charged as applicable at the time of agreement.',
  'Cheques / DD to be drawn in favour of "KEYS REALITY".',
  'Agreement execution charges: Rs.15,000/-, payable in cash at the time of agreement.',
  'In case of booking cancellation, cancellation charges along with cheque return charges (if applicable) will be levied.',
  'Layout plans are subject to change as per Government / PCMC norms.',
  'Maintenance charges applicable at the time of possession for 2 & 2.5 BHK: Rs.3 per sq.ft. + GST.',
  'The project is approved by all major banks and financial institutions. Outside bankers are strictly not allowed.',
  'TDS (if applicable) must be paid immediately after agreement execution to avoid Government penalties (1% of the Agreement Value).',
  'PROJECT APPROVED BY LEADING BANKS : HDFC Bank, Axis Bank, PNB, ICICI Bank, SBI Bank.',
];

const COMMERCIAL_TERMS = [
  'Above-mentioned rates are subject to change without prior notice.',
  'Booking amount: Rs.5,00,000/-.',
  'Government taxes will be charged as applicable at the time of agreement.',
  'Cheques / DD to be drawn in favour of "KEYS REALITY".',
  'Agreement execution charges: Rs.15,000/-, payable in cash at the time of agreement.',
  'In case of booking cancellation, cancellation charges along with cheque return charges (if any) will be applicable.',
  'Layout plans are subject to change as per Government / PCMC norms.',
  'Maintenance charges will be applicable as per the society\'s decision at the time of possession.',
  'The project is approved by all major banks and financial institutions. Outside bankers are strictly not allowed.',
  'TDS (if applicable) must be paid immediately after agreement execution to avoid penalties from the Government (1% of the Agreement Value).',
  'PROJECT APPROVED BY LEADING BANKS : HDFC Bank, Axis Bank, PNB, ICICI Bank, SBI Bank.',
];

const PAYMENT_STAGES = [
  ['On or before execution of the Agreement', '10%'],
  ['Within 15 days from the date of execution of the Agreement', '20%'],
  ['On completion of the plinth of the building / wing in which the said flat is located', '15%'],
  ['On completion of the second slab of the building / wing', '5%'],
  ['On completion of the fourth slab (including podiums & stilts)', '5%'],
  ['On completion of the sixth slab (including podiums & stilts)', '5%'],
  ['On completion of the tenth slab (including podiums & stilts)', '5%'],
  ['On completion of the fourteenth slab (including podiums & stilts)', '5%'],
  ['On completion of walls, internal plaster, flooring, doors & windows of the said flat', '5%'],
  ['On completion of sanitary fittings, staircases, lift wells & lobbies up to the floor level of the said flat', '5%'],
  ['On completion of external plumbing, external plaster, elevation & terrace waterproofing', '5%'],
  ['On completion of lifts, water pumps, electrical fittings, electro-mechanical & environmental requirements, entrance lobbies, plinth protection & paving of common areas', '10%'],
  ['At the time of handing over possession of the flat to the allottee(s) on or after receipt of Occupancy Certificate', '5%'],
];

/* ── STATE ───────────────────────────── */
let currentType = 'Residential';
let selectedUnit = null;

/* ── HELPERS ─────────────────────────── */
function isSoldUnit(u) {
  const s = (u.status || '').toLowerCase().trim();
  return s === 'sold';
}

function formatINR(n) {
  n = Math.round(n);
  if (isNaN(n) || n < 0) return '0';
  let s = String(n);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest   = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return rest + ',' + last3;
}

function amtInWords(n) {
  n = Math.round(n);
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                 'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                 'Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (n === 0) return 'Zero';
  function below1000(x) {
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x/10)] + (x % 10 ? ' ' + ones[x % 10] : '');
    return ones[Math.floor(x/100)] + ' Hundred' + (x % 100 ? ' ' + below1000(x % 100) : '');
  }
  let result = '';
  const cr  = Math.floor(n / 10000000); n %= 10000000;
  const lac = Math.floor(n / 100000);   n %= 100000;
  const th  = Math.floor(n / 1000);     n %= 1000;
  if (cr)  result += below1000(cr)  + ' Crore ';
  if (lac) result += below1000(lac) + ' Lakh ';
  if (th)  result += below1000(th)  + ' Thousand ';
  if (n)   result += below1000(n);
  return result.trim();
}

function calcCosts(agreement, isCommercial, sdGender) {
  const sdPct  = (sdGender === 'female' || sdGender === 'both') ? 0.06 : 0.07;
  const gstPct = isCommercial ? 0.12 : 0.05;
  const sd  = Math.round(agreement * sdPct);
  const gst = Math.round(agreement * gstPct);
  const reg = 30000;
  return { agreement, sd, sdPct, gst, gstPct, reg, total: agreement + sd + gst + reg };
}

/* ── INR symbol safe for PDF (avoids jsPDF encoding bug) ── */
function Rs(n) { return 'Rs.' + formatINR(n); }

/* ── LOGIN ───────────────────────────── */
document.getElementById('login-btn').addEventListener('click', doLogin);
document.getElementById('pwd-input').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogin() {
  const val = document.getElementById('pwd-input').value.trim();
  if (val === PASSWORD) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    initApp();
  } else {
    const err = document.getElementById('login-error');
    err.textContent = 'Incorrect access code. Please try again.';
    setTimeout(() => { err.textContent = ''; }, 3000);
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('pwd-input').value = '';
  selectedUnit = null;
});

/* ── APP INIT ────────────────────────── */
function initApp() {
  document.getElementById('cs-date').value = new Date().toISOString().split('T')[0];
  populateFilters();
  renderUnitGrid();

  document.getElementById('btn-residential').addEventListener('click', () => setType('Residential'));
  document.getElementById('btn-commercial').addEventListener('click',  () => setType('Commercial'));

  ['filter-wing','filter-floor','filter-config','filter-status'].forEach(id => {
    document.getElementById(id).addEventListener('change', renderUnitGrid);
  });

  document.getElementById('back-btn').addEventListener('click', goBack);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);
  document.getElementById('apply-total-btn').addEventListener('click', applyTotalEdit);
  document.getElementById('apr-input').addEventListener('input', onAPRChange);
  document.getElementById('sd-gender').addEventListener('change', recalc);

  document.getElementById('customer-name').addEventListener('input', () => {
    if (document.getElementById('customer-name').value.trim()) {
      document.getElementById('customer-name').classList.remove('field-error');
      document.getElementById('name-error').style.display = 'none';
    }
  });
}

function setType(type) {
  currentType = type;
  document.getElementById('btn-residential').classList.toggle('active', type === 'Residential');
  document.getElementById('btn-commercial').classList.toggle('active',  type === 'Commercial');
  selectedUnit = null;
  document.getElementById('step3').style.display = 'none';
  // Reset filters
  ['filter-wing','filter-floor','filter-config','filter-status'].forEach(id => {
    document.getElementById(id).value = '';
  });
  populateFilters();
  renderUnitGrid();
}

function populateFilters() {
  const pool = UNITS_DATA.filter(u => u.type === currentType);

  const floors = [...new Set(pool.map(u => String(u.floor)))].sort((a,b) => {
    if (a === 'Ground') return -1;
    if (b === 'Ground') return 1;
    return parseInt(a) - parseInt(b);
  });
  const floorSel = document.getElementById('filter-floor');
  const curFloor = floorSel.value;
  floorSel.innerHTML = '<option value="">All Floors</option>' +
    floors.map(f => `<option value="${f}" ${f===curFloor?'selected':''}>${f==='Ground'?'Ground Floor':'Floor '+f}</option>`).join('');

  const configs = [...new Set(pool.map(u => u.config))].sort();
  const configSel = document.getElementById('filter-config');
  const curConfig = configSel.value;
  configSel.innerHTML = '<option value="">All</option>' +
    configs.map(c => `<option value="${c}" ${c===curConfig?'selected':''}>${c}</option>`).join('');
}

/* ── UNIT GRID ───────────────────────── */
function renderUnitGrid() {
  const wing    = document.getElementById('filter-wing').value;
  const floor   = document.getElementById('filter-floor').value;
  const config  = document.getElementById('filter-config').value;
  const statusF = document.getElementById('filter-status').value;

  let units = UNITS_DATA.filter(u => u.type === currentType);
  if (wing)   units = units.filter(u => String(u.wing) === wing);
  if (floor)  units = units.filter(u => String(u.floor) === floor);
  if (config) units = units.filter(u => u.config === config);

  if (statusF === 'unsold') units = units.filter(u => !isSoldUnit(u));
  if (statusF === 'sold')   units = units.filter(u =>  isSoldUnit(u));

  const grid = document.getElementById('unit-grid');
  if (units.length === 0) {
    grid.innerHTML = '<div class="no-units">No units match the selected filters.</div>';
    return;
  }

  grid.innerHTML = units.map(u => {
    const sold       = isSoldUnit(u);
    const isSelected = selectedUnit && String(selectedUnit.sno) === String(u.sno);
    return `<div class="unit-card ${sold?'sold':''} ${isSelected?'selected':''}"
         data-sno="${u.sno}" ${sold?'title="This unit is already sold"':''}>
      <div class="uc-no">Unit ${u.unit_no}</div>
      <div class="uc-wing">Wing ${u.wing} · ${String(u.floor)==='Ground'?'GF':'Fl.'+u.floor}</div>
      <div class="uc-config">${u.config}</div>
      <div class="uc-carpet">${Number(u.carpet_area).toFixed(2)} sq.ft.</div>
      <span class="uc-badge ${sold?'sold':'unsold'}">${sold?'SOLD':'AVAILABLE'}</span>
    </div>`;
  }).join('');

  grid.querySelectorAll('.unit-card:not(.sold)').forEach(card => {
    card.addEventListener('click', () => selectUnit(card.dataset.sno));
  });
}

function goBack() {
  document.getElementById('step3').style.display = 'none';
  selectedUnit = null;
  renderUnitGrid();
  document.getElementById('step2').scrollIntoView({ behavior:'smooth' });
}

/* ── SELECT UNIT ─────────────────────── */
function selectUnit(sno) {
  // sno comparison: data.js uses numbers, dataset is always string
  const raw = UNITS_DATA.find(u => String(u.sno) === String(sno));
  if (!raw) { console.warn('Unit not found:', sno); return; }

  selectedUnit = Object.assign({}, raw);
  selectedUnit._apr       = Number(selectedUnit.apr);
  selectedUnit._agreement = Math.round(selectedUnit._apr * Number(selectedUnit.saleable_area));

  // Show step3, keep step2 visible (no collapse)
  document.getElementById('step3').style.display = 'block';

  // Reset customer name field
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-name').classList.remove('field-error');
  document.getElementById('name-error').style.display = 'none';

  const isCommercial = currentType === 'Commercial';
  const floorStr = String(selectedUnit.floor);

  document.getElementById('info-unit').textContent       = `Unit ${selectedUnit.unit_no}`;
  document.getElementById('info-wing-floor').textContent = `Wing ${selectedUnit.wing} · ${floorStr==='Ground'?'Ground Floor':'Floor '+floorStr}`;
  document.getElementById('info-config').textContent     = selectedUnit.config;
  document.getElementById('info-carpet').textContent     = Number(selectedUnit.carpet_area).toFixed(2);
  document.getElementById('info-saleable').textContent   = Number(selectedUnit.saleable_area).toFixed(2);
  document.getElementById('info-gst-rate').textContent   = isCommercial ? '12%' : '5%';
  document.getElementById('apr-input').value             = selectedUnit._apr;

  const terms = isCommercial ? COMMERCIAL_TERMS : RESIDENTIAL_TERMS;
  document.getElementById('terms-list').innerHTML =
    terms.map(t => `<li>${t}</li>`).join('');

  document.getElementById('stage-section').style.display = isCommercial ? 'none' : 'block';

  recalc();
  setTimeout(() => document.getElementById('step3').scrollIntoView({ behavior:'smooth' }), 60);
}

function onAPRChange() {
  if (!selectedUnit) return;
  const newAPR = parseFloat(document.getElementById('apr-input').value) || 0;
  selectedUnit._apr       = newAPR;
  selectedUnit._agreement = Math.round(newAPR * Number(selectedUnit.saleable_area));
  recalc();
}

/* ── RECALC ──────────────────────────── */
function recalc() {
  if (!selectedUnit) return;
  const isCommercial = currentType === 'Commercial';
  const sdGender     = document.getElementById('sd-gender').value;
  const c = calcCosts(selectedUnit._agreement, isCommercial, sdGender);

  document.getElementById('apr-input').value           = selectedUnit._apr;
  document.getElementById('amt-agreement').textContent = '₹' + formatINR(c.agreement);
  document.getElementById('sd-label').textContent      = `Stamp Duty ${Math.round(c.sdPct*100)}%`;
  document.getElementById('amt-sd').textContent        = '₹' + formatINR(c.sd);
  document.getElementById('gst-label').textContent     = `GST @ ${Math.round(c.gstPct*100)}%`;
  document.getElementById('amt-gst').textContent       = '₹' + formatINR(c.gst);
  document.getElementById('amt-total').textContent     = '₹' + formatINR(c.total);
  document.getElementById('total-input').value         = c.total;
  document.getElementById('words-line').textContent    = `Rupees ${amtInWords(c.total)} Only`;
}

/* ── APPLY TOTAL → BACK-CALC APR ── */
function applyTotalEdit() {
  if (!selectedUnit) return;
  const isCommercial = currentType === 'Commercial';
  const sdGender     = document.getElementById('sd-gender').value;
  const desired = parseFloat(document.getElementById('total-input').value) || 0;
  if (desired <= 30000) return;
  const sdPct  = (sdGender === 'female' || sdGender === 'both') ? 0.06 : 0.07;
  const gstPct = isCommercial ? 0.12 : 0.05;
  const agr    = Math.round((desired - 30000) / (1 + sdPct + gstPct));
  const newAPR = Number(selectedUnit.saleable_area) > 0 ? Math.round(agr / Number(selectedUnit.saleable_area)) : 0;
  selectedUnit._agreement = agr;
  selectedUnit._apr       = newAPR;
  recalc();
}

/* ══════════════════════════════════════════════════════════
   PDF — pixel-perfect match to reference design
   NOTE: jsPDF's standard Helvetica font does NOT support
   the Unicode Rupee sign (U+20B9) or pipe (|).
   We use "Rs." and "/" as safe ASCII substitutes in the PDF.
══════════════════════════════════════════════════════════ */
async function downloadPDF() {
  /* ── Validate customer name (mandatory) ── */
  const custName = document.getElementById('customer-name').value.trim();
  if (!custName) {
    document.getElementById('customer-name').classList.add('field-error');
    document.getElementById('name-error').style.display = 'block';
    document.getElementById('customer-name').focus();
    document.getElementById('customer-name').scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }
  if (!selectedUnit) return;

  const { jsPDF } = window.jspdf;
  const isCommercial = currentType === 'Commercial';
  const sdGender     = document.getElementById('sd-gender').value;
  const c            = calcCosts(selectedUnit._agreement, isCommercial, sdGender);
  const dateVal      = document.getElementById('cs-date').value || new Date().toISOString().split('T')[0];
  const dateStr      = new Date(dateVal + 'T00:00:00').toLocaleDateString('en-IN',
                         { day:'2-digit', month:'long', year:'numeric' });
  const floorStr     = String(selectedUnit.floor);
  const floorLabel   = floorStr === 'Ground' ? 'Ground Floor' : 'Floor ' + floorStr;
  const sdLabel      = sdGender === 'female' ? 'Female (6%)' : sdGender === 'both' ? 'Both (6%)' : 'Male (7%)';

  /* ── Load logos ── */
  let logoTop = null, logoBot = null, bwLogo = null;
  try { logoTop = await loadImg('assets/logo-top.jpg');    } catch(e){}
  try { logoBot = await loadImg('assets/logo-bottom.jpg'); } catch(e){}
  try { bwLogo  = await loadImg('assets/bw_logo.png');    } catch(e){}

  /* ── Colour palette ── */
  const W = 210, H = 297;
  const PURPLE  = [52,  4,  47];
  const GOLD    = [174, 138, 54];
  const GOLD_B  = [196, 158, 66];
  const WHITE   = [255, 255, 255];
  const NEAR_BK = [25,  18,  10];
  const ROW_ALT = [247, 240, 222];
  const GREY_LT = [245, 244, 242];
  const DARK_GY = [70,  60,  50];

  /* ────────────────────────────
     HELPER: page header
  ──────────────────────────── */
  function drawHeader(doc, copyLabel) {
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, W, 42, 'F');

    if (logoTop) {
      doc.addImage(logoTop, 'JPEG', 6, 4, 62, 34);
    } else {
      doc.setTextColor(...GOLD_B); doc.setFontSize(20); doc.setFont('helvetica','bold');
      doc.text('Royal Keys', 10, 26);
    }

    /* RERA badge */
    doc.setFillColor(...WHITE);
    doc.roundedRect(140, 6, 65, 29, 2, 2, 'F');
    doc.setDrawColor(220, 210, 190); doc.setLineWidth(0.25);
    doc.roundedRect(140, 6, 65, 29, 2, 2, 'S');

    doc.setTextColor(110, 90, 70); doc.setFontSize(5.5); doc.setFont('helvetica','normal');
    doc.text('MAHA-RERA Registration No.', 143, 13);
    doc.setFontSize(13.5); doc.setFont('helvetica','bold'); doc.setTextColor(...PURPLE);
    doc.text('P52100079364', 143, 22);
    doc.setFontSize(5); doc.setFont('helvetica','normal'); doc.setTextColor(120, 100, 80);
    doc.text('www.maharera.maharashtra.gov.in', 143, 29);

    /* copy label */
    doc.setFontSize(7); doc.setFont('helvetica','italic'); doc.setTextColor(210, 185, 130);
    doc.text(copyLabel, W - 5, 5.5, { align:'right' });

    /* gold underline */
    doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.8);
    doc.line(0, 42, W, 42);
  }

  /* ────────────────────────────
     HELPER: page footer
  ──────────────────────────── */
  function drawFooter(doc) {
    const FH = 28, FY = H - FH;

    doc.setFillColor(...WHITE);
    doc.rect(0, FY, W, FH, 'F');
    doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.6);
    doc.line(0, FY, W, FY);

    /* logo row separator */
    doc.setDrawColor(200, 190, 175); doc.setLineWidth(0.3);
    doc.line(10, FY + 17, W - 10, FY + 17);

    if (logoBot) {
      doc.addImage(logoBot, 'JPEG', 10, FY + 2, 22, 13);
    }
    if (bwLogo) {
      doc.setFillColor(...WHITE);
      doc.rect(34, FY + 3, 28, 11, 'F');
      doc.addImage(bwLogo, 'PNG', 34, FY + 3, 28, 11);
    }

    doc.setTextColor(...NEAR_BK); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
    doc.text('Dikshita Dak - 94619 30679   |   Kartik Patil - 99213 84868',
             W / 2, FY + 10, { align:'center' });

    doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...DARK_GY);
    doc.text('Contact Us:', 10, FY + 22);
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...PURPLE);
    doc.text('080 6591 7414', 32, FY + 22);

    doc.setDrawColor(180, 170, 155); doc.setLineWidth(0.3);
    doc.line(79, FY + 18, 79, FY + 27);

    doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(80, 70, 60);
    doc.text('Site Address: Royal Keys, Charholi Budruk - Nirgudi Rd,', 83, FY + 22);
    doc.text('Wagholi, Charholi Budruk, Maharashtra 412105', 83, FY + 26.5);

    return FY;
  }

  /* ────────────────────────────
     HELPER: section tag pill
  ──────────────────────────── */
  function drawSectionTag(doc, label, x, y) {
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
    const tw = doc.getTextWidth(label);
    const pw = tw + 8, ph = 7;
    doc.setFillColor(240, 225, 175);
    doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.3);
    doc.roundedRect(x, y, pw, ph, 1, 1, 'FD');
    doc.setTextColor(60, 40, 10);
    doc.text(label, x + 4, y + 5);
    return ph + 4;
  }

  /* ────────────────────────────
     HELPER: cost table (3 cols)
  ──────────────────────────── */
  function drawCostTable(doc, y) {
    const L = 12, TW = W - 24, RH = 11;
    const C1W = TW * 0.37; // Description col width
    const C2W = TW * 0.35; // Rate col width
    // C3 = remainder (Amount)

    /* Header row */
    doc.setFillColor(...GOLD);
    doc.rect(L, y, TW, RH, 'F');
    doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.3);
    doc.rect(L, y, TW, RH, 'S');

    doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
    doc.text('Description',   L + 4,         y + 7.5);
    doc.text('Rate / Details', L + C1W + 4,   y + 7.5);
    doc.text('Amount (Rs.)',   L + TW - 4,    y + 7.5, { align:'right' });
    y += RH;

    /* Body rows */
    const rows = [
      ['Agreement Value',
       `APR: Rs.${formatINR(selectedUnit._apr)} / sq.ft.`,
       'Rs.' + formatINR(c.agreement), false],
      [`Stamp Duty ${Math.round(c.sdPct*100)}%`,
       sdLabel,
       'Rs.' + formatINR(c.sd), true],
      ['Registration Charges',
       'Fixed',
       'Rs.30,000', false],
      [`GST @ ${Math.round(c.gstPct*100)}%`,
       'As applicable',
       'Rs.' + formatINR(c.gst), true],
    ];

    rows.forEach(([lbl, rate, amt, alt]) => {
      if (alt) doc.setFillColor(...ROW_ALT); else doc.setFillColor(...GREY_LT);
      doc.rect(L, y, TW, RH, 'F');
      doc.setDrawColor(210, 195, 160); doc.setLineWidth(0.15);
      doc.rect(L, y, TW, RH, 'S');

      doc.setTextColor(...NEAR_BK); doc.setFont('helvetica','normal'); doc.setFontSize(9);
      doc.text(lbl, L + 4, y + 7.5);

      doc.setFontSize(8.5); doc.setTextColor(...DARK_GY);
      doc.text(rate, L + C1W + 4, y + 7.5);

      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...NEAR_BK);
      doc.text(amt, L + TW - 4, y + 7.5, { align:'right' });

      y += RH;
    });

    /* Total row */
    const TRH = 13;
    doc.setFillColor(...PURPLE);
    doc.rect(L, y, TW, TRH, 'F');
    doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.5);
    doc.rect(L, y, TW, TRH, 'S');

    doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(11);
    doc.text('Total Cost', L + 4, y + 9);

    doc.setTextColor(255, 218, 55); doc.setFontSize(12);
    doc.text('Rs.' + formatINR(c.total), L + TW - 4, y + 9.5, { align:'right' });
    y += TRH;

    return y;
  }

  /* ────────────────────────────
     HELPER: amount in words box
  ──────────────────────────── */
  function drawWordsBox(doc, y) {
    const L = 12, TW = W - 24;
    const text = `Rupees ${amtInWords(c.total)} Only`;
    doc.setFont('helvetica','bolditalic'); doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(text, TW - 10);
    const bh = lines.length * 5.5 + 5;

    doc.setFillColor(250, 245, 228);
    doc.roundedRect(L, y, TW, bh, 1, 1, 'F');
    doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.25);
    doc.roundedRect(L, y, TW, bh, 1, 1, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(L, y, 2.5, bh, 'F');

    doc.setTextColor(50, 35, 10);
    doc.text(lines, L + 6, y + 4.5);
    return y + bh;
  }

  /* ────────────────────────────
     HELPER: stage of payment
  ──────────────────────────── */
  function drawStageTable(doc, y) {
    const L = 12, TW = W - 24;

    PAYMENT_STAGES.forEach(([desc, pct], idx) => {
      doc.setFont('helvetica','normal'); doc.setFontSize(7.8);
      const descLines = doc.splitTextToSize(desc, TW - 22);
      const rh = Math.max(7.5, descLines.length * 4.5 + 3);

      if (idx % 2 === 0) doc.setFillColor(...GREY_LT);
      else               doc.setFillColor(...ROW_ALT);
      doc.rect(L, y, TW, rh, 'F');
      doc.setDrawColor(210, 195, 160); doc.setLineWidth(0.15);
      doc.rect(L, y, TW, rh, 'S');

      doc.setTextColor(...NEAR_BK);
      doc.text(descLines, L + 4, y + 5);

      doc.setFont('helvetica','normal'); doc.setTextColor(...NEAR_BK);
      doc.text(pct, L + TW - 4, y + (rh / 2) + 2.5, { align:'right' });
      y += rh;
    });

    /* TOTAL row */
    doc.setFillColor(...PURPLE);
    doc.rect(L, y, TW, 9, 'F');
    doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.4);
    doc.rect(L, y, TW, 9, 'S');
    doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
    doc.text('TOTAL', L + 4, y + 6.2);
    doc.setTextColor(255, 218, 55);
    doc.text('100%', L + TW - 4, y + 6.2, { align:'right' });
    y += 9;
    return y;
  }

  /* ────────────────────────────
     HELPER: terms
  ──────────────────────────── */
  function drawTerms(doc, y, isCommercial) {
    const L = 12, TW = W - 24;
    const terms = isCommercial ? COMMERCIAL_TERMS : RESIDENTIAL_TERMS;
    doc.setFont('helvetica','normal'); doc.setFontSize(7.8); doc.setTextColor(35, 25, 15);
    for (const t of terms) {
      const lines = doc.splitTextToSize('- ' + t, TW - 6);
      const needed = lines.length * 4.5 + 1.5;
      if (y + needed > H - 35) break;
      doc.text(lines, L + 4, y);
      y += needed;
    }
    return y;
  }

  /* ═══════════════════════════════════
     PAGE 1  — Customer's Copy
  ═══════════════════════════════════ */
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, H, 'F');

  drawHeader(doc, "Customer's Copy");
  drawFooter(doc);

  /* Customer info */
  let y = 49;
  doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.setTextColor(...NEAR_BK);
  doc.text(`Customer Name :  ${custName}`, 12, y);
  doc.text(`Date : ${dateStr}`, W - 12, y, { align:'right' });
  y += 7;

  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(55, 42, 28);
  doc.text(
    `Unit No: ${selectedUnit.unit_no}   /   Wing: ${selectedUnit.wing}   /   ${floorLabel}   /   ${selectedUnit.config}`,
    12, y
  );
  y += 5.5;

  doc.setFontSize(8); doc.setTextColor(75, 58, 38);
  doc.text(
    `Carpet Area: ${Number(selectedUnit.carpet_area).toFixed(2)} sq.ft.   /   Saleable Area: ${Number(selectedUnit.saleable_area).toFixed(2)} sq.ft.   /   APR: Rs.${formatINR(selectedUnit._apr)} / sq.ft.`,
    12, y
  );
  y += 5.5;

  /* divider */
  doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.6);
  doc.line(12, y, W - 12, y);
  y += 8;

  /* Cost table */
  y = drawCostTable(doc, y);
  y += 6;

  /* Amount in words */
  y = drawWordsBox(doc, y);
  y += 8;

  /* Signature box */
  doc.setDrawColor(155, 135, 90); doc.setLineWidth(0.35);
  doc.rect(W - 54, y, 42, 18, 'S');
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(90, 70, 40);
  doc.text('Customer Signature', W - 33, y + 15, { align:'center' });
  y += 22;

  /* divider */
  doc.setDrawColor(...GOLD_B); doc.setLineWidth(0.5);
  doc.line(12, y, W - 12, y);

  /* ═══════════════════════════════════
     PAGE 2  — Sales Copy
  ═══════════════════════════════════ */
  doc.addPage();
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, H, 'F');

  drawHeader(doc, 'Sales Copy');
  drawFooter(doc);

  let y2 = 50;

  /* Terms & Conditions */
  y2 += drawSectionTag(doc, 'Terms and Conditions', 12, y2);
  y2 = drawTerms(doc, y2, isCommercial);
  y2 += 10;

  /* Stage of Payment — residential only */
  if (!isCommercial) {
    y2 += drawSectionTag(doc, 'Stage of Payment', 12, y2);
    y2 = drawStageTable(doc, y2);
  }

  /* ── Save ── */
  const safe = custName.replace(/[^a-zA-Z0-9 _-]/g,'').replace(/\s+/g,'_');
  doc.save(`RoyalKeys_CostSheet_Unit${selectedUnit.unit_no}_${safe}.pdf`);
}

/* ── IMAGE LOADER ────────────────────── */
function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      cv.getContext('2d').drawImage(img, 0, 0);
      res(cv.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = rej;
    img.src = src + '?v=3';
  });
}
