async function downloadPDF() {
  // 1. Mandatory Customer Name Validation
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

  if (!selectedUnit) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const isCommercial = currentType === 'Commercial';
  const sdGender = document.getElementById('sd-gender').value;
  const c = calcCosts(selectedUnit._agreement, isCommercial, sdGender);
  const dateVal = document.getElementById('cs-date').value || new Date().toISOString().split('T')[0];
  const dateStr = new Date(dateVal + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  // Load necessary logos only
  let logoTop = null, logoBot = null, bwLogo = null;
  try { logoTop = await loadImg('assets/logo-top.jpg'); } catch (e) {}
  try { logoBot = await loadImg('assets/logo-bottom.jpg'); } catch (e) {}
  try { bwLogo = await loadImg('assets/bw_logo.png'); } catch (e) {}

  const W = 210, H = 297;
  const DEEP_PURPLE = [52, 4, 47]; // Header Background 
  const GOLD_BRAND = [174, 138, 54]; // Table Headers [cite: 3]
  const TEXT_DARK = [30, 30, 30];

  for (let ci = 0; ci < 2; ci++) {
    if (ci > 0) doc.addPage();
    const copyLabel = ci === 0 ? "CUSTOMER'S COPY" : "SALES COPY";

    // ══ HEADER BAND ══
    doc.setFillColor(...DEEP_PURPLE);
    doc.rect(0, 0, W, 40, 'F');

    if (logoTop) {
      doc.addImage(logoTop, 'JPEG', 10, 5, 50, 30);
    }

    // RERA INFORMATION BLOCK [cite: 4, 26]
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(148, 8, 52, 22, 2, 2, 'F');
    doc.setTextColor(80, 80, 80); doc.setFontSize(6);
    doc.text('MAHA-RERA REGISTRATION NO.', 151, 14);
    doc.setTextColor(...DEEP_PURPLE); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('P52100079364', 151, 20);
    doc.setFontSize(5); doc.setFont('helvetica', 'normal');
    doc.text('www.maharera.maharashtra.gov.in', 151, 25);

    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'italic');
    doc.text(copyLabel, 200, 35, { align: 'right' });

    // ══ CUSTOMER & UNIT INFO ══
    let y = 52;
    doc.setTextColor(...TEXT_DARK); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(`CUSTOMER NAME: ${custName.toUpperCase()}`, 12, y);
    doc.text(`DATE: ${dateStr}`, 198, y, { align: 'right' });

    y += 8;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const unitDetails = `UNIT NO: ${selectedUnit.unit_no} | WING: ${selectedUnit.wing} | CONFIG: ${selectedUnit.config}`;
    doc.text(unitDetails, 12, y);
    
    y += 6;
    doc.text(`Carpet Area: ${selectedUnit.carpet_area.toFixed(2)} sq.ft. | APR: Rs. ${formatINR(selectedUnit._apr)}/sq.ft.`, 12, y);

    // GOLD DIVIDER
    y += 5;
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.6);
    doc.line(12, y, 198, y);
    y += 8;

    // ══ COST TABLE ══
    const tableX = 12, tableW = 186, rowH = 11;
    
    // Header Row 
    doc.setFillColor(...GOLD_BRAND);
    doc.rect(tableX, y, tableW, rowH, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', tableX + 5, y + 7);
    doc.text('AMOUNT (₹)', tableX + tableW - 5, y + 7, { align: 'right' });
    y += rowH;

    // Data Rows with alternating indentation and background 
    const rows = [
      ['Agreement Value', c.agreement, false],
      [`Stamp Duty (${Math.round(c.sdPct*100)}%)`, c.sd, true],
      ['Registration Charges', 30000, false],
      [`GST @ ${Math.round(c.gstPct*100)}%`, c.gst, true]
    ];

    rows.forEach(([label, amt, isAlt]) => {
      if (isAlt) doc.setFillColor(248, 244, 230); else doc.setFillColor(255, 255, 255);
      doc.rect(tableX, y, tableW, rowH, 'F');
      doc.setDrawColor(220, 210, 190); doc.setLineWidth(0.1);
      doc.rect(tableX, y, tableW, rowH, 'S');
      
      doc.setTextColor(...TEXT_DARK); doc.setFont('helvetica', 'normal');
      doc.text(label, tableX + 5, y + 7);
      doc.setFont('helvetica', 'bold');
      doc.text(formatINR(amt), tableX + tableW - 5, y + 7, { align: 'right' });
      y += rowH;
    });

    // Total Row 
    doc.setFillColor(...DEEP_PURPLE);
    doc.rect(tableX, y, tableW, 13, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(10);
    doc.text('TOTAL PACKAGE COST', tableX + 5, y + 8.5);
    doc.setTextColor(255, 220, 60); doc.setFontSize(11);
    doc.text(`₹ ${formatINR(c.total)}/-`, tableX + tableW - 5, y + 8.5, { align: 'right' });
    
    y += 18;
    doc.setTextColor(60, 40, 20); doc.setFontSize(8.5); doc.setFont('helvetica', 'bolditalic');
    doc.text(`Rupees ${amtInWords(c.total)} Only`, tableX, y);

    // ══ FOOTER SECTION ══
    const fY = 275;
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5);
    doc.line(10, fY, 200, fY);

    if (logoBot) doc.addImage(logoBot, 'JPEG', 12, fY + 2, 28, 16);
    if (bwLogo) doc.addImage(bwLogo, 'PNG', 45, fY + 4, 24, 12);

    doc.setTextColor(...TEXT_DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    doc.text('Dikshita Dak – 94619 30679   |   Kartik Patil – 99213 84868', 105, fY + 8, { align: 'center' }); // [cite: 19, 48]
    
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('Contact: 080 6591 7414', 105, fY + 14, { align: 'center' }); // [cite: 21, 49]
    doc.setFontSize(6.5);
    doc.text('Site Address: Royal Keys, Charholi Budruk - Nirgudi Rd, Wagholi, Pune 412105', 105, fY + 19, { align: 'center' }); // [cite: 22, 49]
  }

  const safeName = custName.replace(/[^a-z0-9]/gi, '_');
  doc.save(`RoyalKeys_CostSheet_${safeName}.pdf`);
}
