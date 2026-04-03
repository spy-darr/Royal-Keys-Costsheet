/* ════════════════════════════════════════
   ROYAL KEYS COST SHEET — APP.JS
   ════════════════════════════════════════ */

/* ── CONFIG ──────────────────────────── */
const PASSWORD = 'RoyalKeys@2026';   // change as needed

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
  'PROJECT APPROVED BY LEADING BANKS: HDFC Bank, Axis Bank, PNB, ICICI Bank, SBI Bank.',
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
  'PROJECT APPROVED BY LEADING BANKS: HDFC Bank, Axis Bank, PNB, ICICI Bank, SBI Bank.',
];

/* ── STATE ───────────────────────────── */
let currentType = 'Residential';
let selectedUnit = null;

/* ── HELPERS ─────────────────────────── */
function formatINR(n) {
  n = Math.round(n);
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
    if (x < 100) return tens[Math.floor(x/10)] + (x%10 ? ' ' + ones[x%10] : '');
    return ones[Math.floor(x/100)] + ' Hundred' + (x%100 ? ' ' + below1000(x%100) : '');
  }
  let result = '';
  const cr = Math.floor(n / 10000000); n %= 10000000;
  const lac = Math.floor(n / 100000);  n %= 100000;
  const th  = Math.floor(n / 1000);    n %= 1000;
  if (cr)  result += below1000(cr) + ' Crore ';
  if (lac) result += below1000(lac) + ' Lakh ';
  if (th)  result += below1000(th) + ' Thousand ';
  if (n)   result += below1000(n);
  return result.trim();
}

function calcCosts(agreement, isCommercial, sdGender) {
  const sdPct = (sdGender === 'female' || sdGender === 'both') ? 0.06 : 0.07;
  const gstPct = isCommercial ? 0.12 : 0.05;
  const sd   = Math.round(agreement * sdPct);
  const gst  = Math.round(agreement * gstPct);
  const reg  = 30000;
  return { agreement, sd, sdPct, gst, gstPct, reg, total: agreement + sd + gst + reg };
}

function agreementFromAPR(unit) {
  // Agreement = APR × saleable_area
  return Math.round(unit.apr * unit.saleable_area);
}

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
    setTimeout(() => err.textContent = '', 3000);
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('pwd-input').value = '';
});

/* ── APP INIT ────────────────────────── */
function initApp() {
  // Set today's date
  const today = new Date();
  document.getElementById('cs-date').value = today.toISOString().split('T')[0];

  renderUnitGrid();

  document.getElementById('btn-residential').addEventListener('click', () => setType('Residential'));
  document.getElementById('btn-commercial').addEventListener('click',  () => setType('Commercial'));

  document.getElementById('filter-wing').addEventListener('change', renderUnitGrid);
  document.getElementById('filter-floor').addEventListener('change', renderUnitGrid);
  document.getElementById('filter-config').addEventListener('change', renderUnitGrid);
  document.getElementById('filter-status').addEventListener('change', renderUnitGrid);

  document.getElementById('back-btn').addEventListener('click', goBack);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);
  document.getElementById('apply-total-btn').addEventListener('click', applyTotalEdit);

  document.getElementById('apr-input').addEventListener('input', () => {
    if (!selectedUnit) return;
    const newAPR = parseFloat(document.getElementById('apr-input').value) || 0;
    selectedUnit._overrideApr = newAPR;
    selectedUnit._overrideAgreement = Math.round(newAPR * selectedUnit.saleable_area);
    recalc();
  });

  document.getElementById('sd-gender').addEventListener('change', recalc);
}

function setType(type) {
  currentType = type;
  document.getElementById('btn-residential').classList.toggle('active', type === 'Residential');
  document.getElementById('btn-commercial').classList.toggle('active', type === 'Commercial');
  selectedUnit = null;
  document.getElementById('step3').style.display = 'none';
  renderUnitGrid();
}

/* ── UNIT GRID ───────────────────────── */
function renderUnitGrid() {
  const wing   = document.getElementById('filter-wing').value;
  const floor  = document.getElementById('filter-floor').value;
  const config = document.getElementById('filter-config').value;
  const status = document.getElementById('filter-status').value;

  let units = UNITS_DATA.filter(u => u.type === currentType);
  if (wing)   units = units.filter(u => u.wing === wing);
  if (floor)  units = units.filter(u => u.floor === floor);
  if (config) units = units.filter(u => u.config === config);
  if (status) units = units.filter(u => u.status.includes(status));

  // Populate floor filter
  const floors = [...new Set(UNITS_DATA.filter(u => u.type === currentType)
    .map(u => u.floor))].sort((a,b) => {
      if (a === 'Ground') return -1;
      if (b === 'Ground') return 1;
      return parseInt(a) - parseInt(b);
    });
  const floorSel = document.getElementById('filter-floor');
  const curFloor = floorSel.value;
  floorSel.innerHTML = '<option value="">All Floors</option>' +
    floors.map(f => `<option value="${f}" ${f === curFloor ? 'selected' : ''}>${f === 'Ground' ? 'Ground Floor' : 'Floor ' + f}</option>`).join('');

  // Populate config filter
  const configs = [...new Set(UNITS_DATA.filter(u => u.type === currentType).map(u => u.config))].sort();
  const configSel = document.getElementById('filter-config');
  const curConfig = configSel.value;
  configSel.innerHTML = '<option value="">All</option>' +
    configs.map(c => `<option value="${c}" ${c === curConfig ? 'selected' : ''}>${c}</option>`).join('');

  const grid = document.getElementById('unit-grid');
  if (units.length === 0) {
    grid.innerHTML = '<div class="no-units">No units match the selected filters.</div>';
    return;
  }

  grid.innerHTML = units.map(u => {
    const isSold = u.status.includes('sold') && !u.status.includes('unsold');
    const badge = isSold
      ? '<span class="uc-badge sold">SOLD</span>'
      : '<span class="uc-badge unsold">AVAILABLE</span>';
    return `
      <div class="unit-card ${isSold ? 'sold' : ''} ${selectedUnit && selectedUnit.sno === u.sno ? 'selected' : ''}"
           data-sno="${u.sno}" ${isSold ? 'title="This unit is sold"' : ''}>
        <div class="uc-no">Unit ${u.unit_no}</div>
        <div class="uc-wing">Wing ${u.wing} · ${u.floor === 'Ground' ? 'GF' : 'Floor ' + u.floor}</div>
        <div class="uc-config">${u.config}</div>
        <div class="uc-carpet">${u.carpet_area} sq.ft. carpet</div>
        ${badge}
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
  document.getElementById('step2').scrollIntoView({ behavior: 'smooth' });
}

/* ── SELECT UNIT ─────────────────────── */
function selectUnit(sno) {
  selectedUnit = UNITS_DATA.find(u => u.sno === sno);
  if (!selectedUnit) return;
  selectedUnit._overrideApr = null;
  selectedUnit._overrideAgreement = null;

  // Highlight card
  renderUnitGrid();

  // Populate step 3
  const isCommercial = currentType === 'Commercial';
  const apr = selectedUnit.apr;
  const agreement = Math.round(apr * selectedUnit.saleable_area);

  document.getElementById('info-unit').textContent  = `Unit ${selectedUnit.unit_no}`;
  document.getElementById('info-wing-floor').textContent = `Wing ${selectedUnit.wing} · ${selectedUnit.floor === 'Ground' ? 'Ground Floor' : 'Floor ' + selectedUnit.floor}`;
  document.getElementById('info-config').textContent  = selectedUnit.config;
  document.getElementById('info-carpet').textContent  = selectedUnit.carpet_area.toFixed(2);
  document.getElementById('info-saleable').textContent = selectedUnit.saleable_area.toFixed(2);
  document.getElementById('info-gst-rate').textContent = isCommercial ? '12%' : '5%';
  document.getElementById('apr-input').value = apr;

  // Terms
  const terms = isCommercial ? COMMERCIAL_TERMS : RESIDENTIAL_TERMS;
  document.getElementById('terms-list').innerHTML = terms.map(t => `<li>${t}</li>`).join('');

  document.getElementById('step3').style.display = 'block';
  recalc();
  setTimeout(() => document.getElementById('step3').scrollIntoView({ behavior: 'smooth' }), 50);
}

/* ── RECALC ──────────────────────────── */
function recalc() {
  if (!selectedUnit) return;
  const isCommercial = currentType === 'Commercial';
  const sdGender = document.getElementById('sd-gender').value;

  const apr = selectedUnit._overrideApr !== null ? selectedUnit._overrideApr : selectedUnit.apr;
  const agreement = selectedUnit._overrideAgreement !== null
    ? selectedUnit._overrideAgreement
    : Math.round(apr * selectedUnit.saleable_area);

  const c = calcCosts(agreement, isCommercial, sdGender);

  document.getElementById('apr-input').value = apr;
  document.getElementById('amt-agreement').textContent = '₹' + formatINR(c.agreement);
  document.getElementById('sd-label').textContent = `Stamp Duty (${Math.round(c.sdPct * 100)}%)`;
  document.getElementById('amt-sd').textContent  = '₹' + formatINR(c.sd);
  document.getElementById('gst-label').textContent = `GST (${Math.round(c.gstPct * 100)}%)`;
  document.getElementById('gst-detail').textContent = isCommercial ? '12% Commercial' : '5% Residential';
  document.getElementById('amt-gst').textContent = '₹' + formatINR(c.gst);
  document.getElementById('amt-total').textContent = '₹' + formatINR(c.total);
  document.getElementById('words-line').textContent =
    `Amount in Words: Rupees ${amtInWords(c.total)} Only`;

  // sync total edit box
  document.getElementById('total-input').value = c.total;
}

/* ── APPLY TOTAL EDIT ────────────────── */
function applyTotalEdit() {
  if (!selectedUnit) return;
  const isCommercial = currentType === 'Commercial';
  const sdGender = document.getElementById('sd-gender').value;
  const desiredTotal = parseFloat(document.getElementById('total-input').value) || 0;
  if (desiredTotal <= 30000) return;

  const sdPct  = (sdGender === 'female' || sdGender === 'both') ? 0.06 : 0.07;
  const gstPct = isCommercial ? 0.12 : 0.05;

  // total = agreement + agreement*sdPct + agreement*gstPct + 30000
  // => agreement = (total - 30000) / (1 + sdPct + gstPct)
  const agreement = Math.round((desiredTotal - 30000) / (1 + sdPct + gstPct));
  const newAPR = selectedUnit.saleable_area > 0
    ? Math.round(agreement / selectedUnit.saleable_area)
    : 0;

  selectedUnit._overrideAgreement = agreement;
  selectedUnit._overrideApr = newAPR;
  recalc();
}

/* ── PDF DOWNLOAD ────────────────────── */
async function downloadPDF() {
  if (!selectedUnit) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const isCommercial = currentType === 'Commercial';
  const sdGender = document.getElementById('sd-gender').value;
  const apr = selectedUnit._overrideApr !== null ? selectedUnit._overrideApr : selectedUnit.apr;
  const agreement = selectedUnit._overrideAgreement !== null
    ? selectedUnit._overrideAgreement
    : Math.round(apr * selectedUnit.saleable_area);
  const c = calcCosts(agreement, isCommercial, sdGender);
  const custName = document.getElementById('customer-name').value.trim() || '____________________';
  const dateVal  = document.getElementById('cs-date').value || new Date().toISOString().split('T')[0];
  const dateStr  = new Date(dateVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const W = 210, H = 297;

  for (const copyLabel of ["Customer's Copy", "Sales Copy"]) {
    if (copyLabel !== "Customer's Copy") doc.addPage();

    // ── Background
    doc.setFillColor(15, 0, 16);
    doc.rect(0, 0, W, H, 'F');

    // ── Header band
    doc.setFillColor(61, 0, 56);
    doc.rect(0, 0, W, 38, 'F');

    // ── Gold border lines
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(0, 38, W, 38);
    doc.line(0, 39, W, 39);

    // ── Logo (top-left)
    try {
      const logoData = await loadImageAsBase64('assets/logo-top.jpg');
      doc.addImage(logoData, 'JPEG', 8, 4, 40, 28);
    } catch(e) {}

    // ── Logo bottom right (footer area)
    try {
      const logoBot = await loadImageAsBase64('assets/logo-bottom.jpg');
      doc.addImage(logoBot, 'JPEG', 120, 272, 40, 20);
    } catch(e) {}
    try {
      const bwLogo = await loadImageAsBase64('assets/bw_logo.png');
      doc.addImage(bwLogo, 'PNG', 165, 274, 30, 16);
    } catch(e) {}

    // ── Header text
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ROYAL KEYS', 105, 15, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(220, 200, 160);
    doc.text('Charholi Budruk · Wagholi · Pune  |  MAHA-RERA: P52100079364', 105, 22, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(240, 230, 200);
    doc.text('COST SHEET', 105, 32, { align: 'center' });

    // ── Copy label
    doc.setFontSize(7);
    doc.setTextColor(160, 140, 100);
    doc.text(copyLabel, 200, 8, { align: 'right' });

    // ── Customer & unit info
    let y = 46;
    doc.setTextColor(240, 220, 180);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Customer Name: ${custName}`, 12, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateStr}`, 160, y, { align: 'left' });

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Unit No: ${selectedUnit.unit_no}  |  Wing: ${selectedUnit.wing}  |  Floor: ${selectedUnit.floor}  |  Config: ${selectedUnit.config}`, 12, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 160, 120);
    doc.text(`Carpet Area: ${selectedUnit.carpet_area.toFixed(2)} sq.ft.   |   Saleable Area: ${selectedUnit.saleable_area.toFixed(2)} sq.ft.`, 12, y);

    // ── Separator
    y += 5;
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.4);
    doc.line(12, y, W - 12, y);
    y += 5;

    // ── Cost Table Header
    doc.setFillColor(61, 0, 56);
    doc.roundedRect(12, y, W - 24, 9, 1.5, 1.5, 'F');
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 20, y + 6);
    doc.text('AMOUNT (₹)', 150, y + 6, { align: 'left' });
    y += 12;

    // ── Table rows
    const rows = [
      [`Agreement Value  (APR: ₹${formatINR(apr)}/sq.ft.)`, formatINR(c.agreement)],
      [`Stamp Duty (${Math.round(c.sdPct * 100)}%)`, formatINR(c.sd)],
      ['Registration Charges', '30,000'],
      [`GST (${Math.round(c.gstPct * 100)}%)`, formatINR(c.gst)],
    ];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const [desc, amt] of rows) {
      doc.setFillColor(26, 0, 26);
      doc.rect(12, y - 4, W - 24, 9, 'F');
      doc.setDrawColor(60, 40, 60);
      doc.setLineWidth(0.1);
      doc.rect(12, y - 4, W - 24, 9, 'S');
      doc.setTextColor(200, 185, 155);
      doc.text(desc, 20, y + 2);
      doc.setTextColor(240, 220, 180);
      doc.setFont('helvetica', 'bold');
      doc.text('₹ ' + amt, W - 14, y + 2, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 10;
    }

    // ── Total row
    doc.setFillColor(61, 0, 56);
    doc.roundedRect(12, y - 2, W - 24, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.roundedRect(12, y - 2, W - 24, 12, 1.5, 1.5, 'S');
    doc.setTextColor(230, 200, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ALL INCLUSIVE TOTAL', 20, y + 6);
    doc.setFontSize(13);
    doc.setTextColor(255, 220, 100);
    doc.text('₹ ' + formatINR(c.total), W - 14, y + 7, { align: 'right' });
    y += 16;

    // ── Amount in words
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(180, 155, 100);
    const wordLine = `Amount in Words: Rupees ${amtInWords(c.total)} Only`;
    const wLines = doc.splitTextToSize(wordLine, W - 24);
    doc.text(wLines, 12, y);
    y += wLines.length * 5 + 5;

    // ── Stage of Payment (Residential only)
    if (!isCommercial) {
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.3);
      doc.line(12, y, W - 12, y);
      y += 5;
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('STAGE OF PAYMENT', 12, y);
      y += 5;

      const stages = [
        ['On or before execution of Agreement', '10%'],
        ['Within 15 days from Agreement date', '20%'],
        ['On completion of plinth', '15%'],
        ['On completion of 2nd slab', '5%'],
        ['On completion of 4th slab', '5%'],
        ['On completion of 6th slab', '5%'],
        ['On completion of 10th slab', '5%'],
        ['On completion of 14th slab', '5%'],
        ['On completion of walls, internal plaster, flooring', '5%'],
        ['On completion of sanitary fittings & staircases', '5%'],
        ['On completion of external plumbing & plaster', '5%'],
        ['On completion of lifts, pumps & electrical fittings', '10%'],
        ['At time of handing over possession (OC)', '5%'],
      ];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      for (const [desc, pct] of stages) {
        doc.setFillColor(26, 0, 26);
        doc.rect(12, y - 3, W - 24, 5.5, 'F');
        doc.setTextColor(180, 160, 130);
        doc.text(desc, 14, y + 1);
        doc.setTextColor(201, 168, 76);
        doc.setFont('helvetica', 'bold');
        doc.text(pct, W - 14, y + 1, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        y += 5.5;
      }
      y += 3;
    }

    // ── Terms
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.3);
    doc.line(12, y, W - 12, y);
    y += 5;
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS', 12, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(150, 130, 100);
    const terms = isCommercial ? COMMERCIAL_TERMS : RESIDENTIAL_TERMS;
    for (let i = 0; i < terms.length; i++) {
      const lines = doc.splitTextToSize(`${i+1}. ${terms[i]}`, W - 24);
      doc.text(lines, 12, y);
      y += lines.length * 3.5;
    }

    // ── Footer band
    doc.setFillColor(40, 0, 40);
    doc.rect(0, H - 22, W, 22, 'F');
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.4);
    doc.line(0, H - 22, W, H - 22);

    doc.setTextColor(180, 155, 100);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact: 080 6591 7414', 105, H - 14, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Dikshita Dak – 94619 30679  |  Kartik Patil – 99213 84868', 105, H - 8, { align: 'center' });

    // ── Signature box
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.3);
    doc.rect(W - 55, y + 5, 43, 15);
    doc.setTextColor(160, 140, 100);
    doc.setFontSize(6);
    doc.text('Customer Signature', W - 33.5, y + 22, { align: 'center' });
  }

  const fname = `RoyalKeys_CostSheet_Unit${selectedUnit.unit_no}_${custName.replace(/\s+/g,'_')}.pdf`;
  doc.save(fname);
}

/* ── IMAGE LOADER ────────────────────── */
function loadImageAsBase64(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      resolve(c.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = src;
  });
}
