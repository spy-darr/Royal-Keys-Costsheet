/* ════════════════════════════════════════
   ROYAL KEYS COST SHEET — APP.JS v2.1
   ════════════════════════════════════════ */

const PASSWORD = 'RoyalKeys@2026';

const RESIDENTIAL_TERMS = [
  'Above-mentioned rates are subject to change without prior notice.',
  'Booking amount: ₹2,00,000/-.',
  'Government taxes will be charged as applicable at the time of agreement.',
  'Cheques / DD to be drawn in favour of "KEYS REALITY".',
  'Agreement execution charges: ₹15,000/-, payable in cash at the time of agreement.',
  'In case of booking cancellation, cancellation charges along with cheque return charges (if applicable) will be levied.',
  'Layout plans are subject to change as per Government / PCMC norms.',
  'Maintenance charges applicable at the time of possession for 2 & 2.5 BHK: ₹3 per sq.ft. + GST.',
  'The project is approved by all major banks and financial institutions. Outside bankers are strictly not allowed.',
  'TDS (if applicable) must be paid immediately after agreement execution to avoid Government penalties (1% of the Agreement Value).',
  'PROJECT APPROVED BY LEADING BANKS : HDFC Bank, Axis Bank, PNB, ICICI Bank, SBI Bank.'
];

const COMMERCIAL_TERMS = [
  'Above-mentioned rates are subject to change without prior notice.',
  'Booking amount: ₹5,00,000/-.',
  'Government taxes will be charged as applicable at the time of agreement.',
  'Cheques / DD to be drawn in favour of "KEYS REALITY".',
  'Agreement execution charges: ₹15,000/-, payable in cash at the time of agreement.',
  'In case of booking cancellation, cancellation charges along with cheque return charges (if any) will be applicable.',
  'Layout plans are subject to change as per Government / PCMC norms.',
  'Maintenance charges will be applicable as per the society\'s decision at the time of possession.',
  'The project is approved by all major banks and financial institutions. Outside bankers are strictly not allowed.',
  'TDS (if applicable) must be paid immediately after agreement execution to avoid penalties from the Government (1% of the Agreement Value).',
  'PROJECT APPROVED BY LEADING BANKS : HDFC Bank, Axis Bank, PNB, ICICI Bank, SBI Bank.'
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
  ['At the time of handing over possession of the flat to the allottee(s) on or after receipt of Occupancy Certificate', '5%']
];

/* ── STATE ── */
let currentType = 'Residential';
let selectedUnit = null;

/* ── HELPERS ── */
function isSoldUnit(u) {
  const s = (u.status || '').toLowerCase().trim();
  return s.startsWith('sold') || (s.includes('sold') && !s.includes('unsold'));
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

/* ── LOGIN ── */
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

/* ── APP INIT ── */
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
  document.getElementById('step2').classList.remove('collapsed');
  ['filter-wing','filter-floor','filter-config','filter-status'].forEach(id => {
    document.getElementById(id).value = '';
  });
  populateFilters();
  renderUnitGrid();
}

function populateFilters() {
  const pool = UNITS_DATA.filter(u => u.type === currentType);
  const floors = [...new Set(pool.map(u => u.floor))].sort((a,b) => {
    if (a === 'Ground') return -1;
    if (b === 'Ground') return 1;
    return parseInt(a) - parseInt(b);
  });
  const floorSel = document.getElementById('filter-floor');
  floorSel.innerHTML = '<option value="">All Floors</option>' +
    floors.map(f => `<option value="${f}">${f==='Ground'?'Ground Floor':'Floor '+f}</option>`).join('');

  const configs = [...new Set(pool.map(u => u.config))].sort();
  const configSel = document.getElementById('filter-config');
  configSel.innerHTML = '<option value="">All</option>' +
    configs.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderUnitGrid() {
  const wing    = document.getElementById('filter-wing').value;
  const floor   = document.getElementById('filter-floor').value;
  const config  = document.getElementById('filter-config').value;
  const statusF = document.getElementById('filter-status').value;

  let units = UNITS_DATA.filter(u => u.type === currentType);
  if (wing)   units = units.filter(u => u.wing === wing);
  if (floor)  units = units.filter(u => u.floor === floor);
  if (config) units = units.filter(u => u.config === config);
  if (statusF === 'unsold') units = units.filter(u => !isSoldUnit(u));
  if (statusF === 'sold')   units = units.filter(u =>  isSoldUnit(u));

  const grid = document.getElementById('unit-grid');
  if (units.length === 0) {
    grid.innerHTML = '<div class="no-units">No units match the selected filters.</div>';
    return;
  }

  grid.innerHTML = units.map(u => {
    const sold = isSoldUnit(u);
    return `<div class="unit-card ${sold?'sold':''}" data-sno="${u.sno}">
      <div class="uc-no">Unit ${u.unit_no}</div>
      <div class="uc-wing">Wing ${u.wing} · ${u.floor==='Ground'?'GF':'Fl.'+u.floor}</div>
      <div class="uc-config">${u.config}</div>
      <div class="uc-carpet">${u.carpet_area.toFixed(2)} sq.ft.</div>
      <span class="uc-badge ${sold?'sold':'unsold'}">${sold?'SOLD':'AVAILABLE'}</span>
    </div>`;
  }).join('');

  grid.querySelectorAll('.unit-card:not(.sold)').forEach(card => {
    card.addEventListener('click', () => selectUnit(card.dataset.sno));
  });
}

function selectUnit(sno) {
  const raw = UNITS_DATA.find(u => u.sno === sno);
  if (!raw) return;
  selectedUnit = {...raw, _apr: raw.apr, _agreement: Math.round(raw.apr * raw.saleable_area)};

  document.getElementById('step2').classList.add('collapsed');
  document.getElementById('step3').style.display = 'block';

  document.getElementById('info-unit').textContent = `Unit ${selectedUnit.unit_no}`;
  document.getElementById('info-wing-floor').textContent = `Wing ${selectedUnit.wing} · ${selectedUnit.floor==='Ground'?'Ground Floor':'Floor '+selectedUnit.floor}`;
  document.getElementById('info-config').textContent = selectedUnit.config;
  document.getElementById('info-carpet').textContent = selectedUnit.carpet_area.toFixed(2);
  document.getElementById('info-saleable').textContent = selectedUnit.saleable_area.toFixed(2);
  document.getElementById('info-gst-rate').textContent = currentType === 'Commercial' ? '12%' : '5%';
  document.getElementById('apr-input').value = selectedUnit._apr;

  const terms = currentType === 'Commercial' ? COMMERCIAL_TERMS : RESIDENTIAL_TERMS;
  document.getElementById('terms-list').innerHTML = terms.map(t => `<li>${t}</li>`).join('');
  document.getElementById('stage-section').style.display = currentType === 'Commercial' ? 'none' : 'block';

  recalc();
  setTimeout(() => document.getElementById('step3').scrollIntoView({ behavior:'smooth' }), 60);
}

function onAPRChange() {
  if (!selectedUnit) return;
  selectedUnit._apr = parseFloat(document.getElementById('apr-input').value) || 0;
  selectedUnit._agreement = Math.round(selectedUnit._apr * selectedUnit.saleable_area);
  recalc();
}

function recalc() {
  if (!selectedUnit) return;
  const isComm = currentType === 'Commercial';
  const sdG = document.getElementById('sd-gender').value;
  const c = calcCosts(selectedUnit._agreement, isComm, sdG);

  document.getElementById('amt-agreement').textContent = '₹' + formatINR(c.agreement);
  document.getElementById('sd-label').textContent = `Stamp Duty ${Math.round(c.sdPct*100)}%`;
  document.getElementById('amt-sd').textContent = '₹' + formatINR(c.sd);
  document.getElementById('gst-label').textContent = `GST @ ${Math.round(c.gstPct*100)}%`;
  document.getElementById('amt-gst').textContent = '₹' + formatINR(c.gst);
  document.getElementById('amt-total').textContent = '₹' + formatINR(c.total);
  document.getElementById('total-input').value = c.total;
  document.getElementById('words-line').textContent = `Rupees ${amtInWords(c.total)} Only`;
}

function applyTotalEdit() {
  if (!selectedUnit) return;
  const desired = parseFloat(document.getElementById('total-input').value) || 0;
  if (desired <= 30000) return;
  const sdPct = (document.getElementById('sd-gender').value === 'male') ? 0.07 : 0.06;
  const gstPct = currentType === 'Commercial' ? 0.12 : 0.05;
  const agr = Math.round((desired - 30000) / (1 + sdPct + gstPct));
  selectedUnit._agreement = agr;
  selectedUnit._apr = Math.round(agr / selectedUnit.saleable_area);
  recalc();
}

function goBack() {
  document.getElementById('step3').style.display = 'none';
  document.getElementById('step2').classList.remove('collapsed');
  selectedUnit = null;
}

/* ── PDF GENERATION ── */
async function downloadPDF() {
  const nameInput = document.getElementById('customer-name');
  const nameError = document.getElementById('name-error');
  const custName = nameInput.value.trim();

  if (!custName) {
    nameInput.classList.add('field-error');
    nameError.style.display = 'block';
    nameInput.focus();
    nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const isComm = currentType === 'Commercial';
  const c = calcCosts(selectedUnit._agreement, isComm, document.getElementById('sd-gender').value);
  const dateStr = new Date(document.getElementById('cs-date').value + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  let logoTop = null, logoBot = null, bwLogo = null;
  try { logoTop = await loadImg('assets/logo-top.jpg'); } catch(e){}
  try { logoBot = await loadImg('assets/logo-bottom.jpg'); } catch(e){}
  try { bwLogo = await loadImg('assets/bw_logo.png'); } catch(e){}

  const DEEP_PURPLE = [52, 4, 47];
  const GOLD_BRAND = [174, 138, 54];

  for (let ci = 0; ci < 2; ci++) {
    if (ci > 0) doc.addPage();
    doc.setFillColor(...DEEP_PURPLE); doc.rect(0, 0, 210, 40, 'F');
    if (logoTop) doc.addImage(logoTop, 'JPEG', 10, 5, 50, 30);

    doc.setFillColor(255, 255, 255); doc.roundedRect(148, 8, 52, 22, 2, 2, 'F');
    doc.setTextColor(80, 80, 80); doc.setFontSize(6); doc.text('MAHA-RERA REGISTRATION NO.', 151, 14);
    doc.setTextColor(...DEEP_PURPLE); doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('P52100079364', 151, 20);

    doc.setTextColor(30, 30, 30); doc.setFontSize(10); doc.text(`CUSTOMER: ${custName.toUpperCase()}`, 12, 52);
    doc.text(`DATE: ${dateStr}`, 198, 52, { align: 'right' });

    let y = 70;
    doc.setFillColor(...GOLD_BRAND); doc.rect(12, y, 186, 11, 'F');
    doc.setTextColor(255, 255, 255); doc.text('DESCRIPTION', 17, y + 7);
    doc.text('AMOUNT (₹)', 193, y + 7, { align: 'right' });

    y += 11;
    const rows = [['Agreement Value', c.agreement], [`Stamp Duty (${Math.round(c.sdPct*100)}%)`, c.sd], ['Registration Charges', 30000], [`GST @ ${Math.round(c.gstPct*100)}%`, c.gst]];
    rows.forEach(([l, a], i) => {
      if (i % 2) doc.setFillColor(248, 244, 230); else doc.setFillColor(255, 255, 255);
      doc.rect(12, y, 186, 11, 'F');
      doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal'); doc.text(l, 17, y + 7);
      doc.setFont('helvetica', 'bold'); doc.text(formatINR(a), 193, y + 7, { align: 'right' });
      y += 11;
    });

    doc.setFillColor(...DEEP_PURPLE); doc.rect(12, y, 186, 13, 'F');
    doc.setTextColor(255, 255, 255); doc.text('TOTAL PACKAGE COST', 17, y + 8.5);
    doc.setTextColor(255, 220, 60); doc.text(`₹ ${formatINR(c.total)}/-`, 193, y + 8.5, { align: 'right' });

    const fY = 275;
    doc.setDrawColor(201, 168, 76); doc.line(10, fY, 200, fY);
    if (logoBot) doc.addImage(logoBot, 'JPEG', 12, fY + 2, 28, 16);
    if (bwLogo) doc.addImage(bwLogo, 'PNG', 45, fY + 4, 24, 12);
  }
  doc.save(`RoyalKeys_CostSheet_${custName.replace(/\s+/g, '_')}.pdf`);
}

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
    img.src = src;
  });
}
