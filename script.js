// Paste the JSON data I extracted from your Excel here
const inventory = [{"unit": "201", "type": "Residential", "carpet": 720.76, "apr": 4900}, {"unit": "101", "type": "Commercial", "carpet": 321, "apr": 15000}]; // ... and the rest of the 247 units

document.getElementById('curr-date').innerText = new Date().toLocaleDateString();

function checkPass() {
    if (document.getElementById('pass-input').value === "RK2026") {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
    } else { alert("Access Denied"); }
}

function syncCust() {
    document.getElementById('disp-cust-name').innerText = document.getElementById('cust-name').value || "Valued Client";
}

function loadUnit() {
    const val = document.getElementById('unit-search').value;
    const type = document.getElementById('unit-type').value;
    const unit = inventory.find(u => u.unit == val && u.type == type);

    if (unit) {
        document.getElementById('disp-unit').innerText = unit.unit;
        document.getElementById('disp-type').innerText = unit.type;
        document.getElementById('disp-carpet').innerText = unit.carpet;
        document.getElementById('input-apr').value = unit.apr;
        document.getElementById('gst-rate').innerText = (unit.type === 'Residential') ? 5 : 12;
        updateByAPR();
    } else { alert("Unit not found for " + type); }
}

function updateByAPR() {
    const carpet = parseFloat(document.getElementById('disp-carpet').innerText);
    const apr = parseFloat(document.getElementById('input-apr').value) || 0;
    const gstPct = parseFloat(document.getElementById('gst-rate').innerText) / 100;

    const agreement = carpet * apr;
    const stamp = Math.round(agreement * 0.07);
    const gst = Math.round(agreement * gstPct);
    const total = agreement + stamp + 30000 + gst;

    document.getElementById('disp-agreement').innerText = Math.round(agreement).toLocaleString();
    document.getElementById('disp-stamp').innerText = stamp.toLocaleString();
    document.getElementById('disp-gst').innerText = gst.toLocaleString();
    document.getElementById('input-total').value = Math.round(total);
}

function updateByTotal() {
    const total = parseFloat(document.getElementById('input-total').value) || 0;
    const carpet = parseFloat(document.getElementById('disp-carpet').innerText);
    const gstPct = parseFloat(document.getElementById('gst-rate').innerText) / 100;

    // Logic: Total = (C*A) + (C*A*0.07) + 30000 + (C*A*GST)
    const apr = (total - 30000) / (carpet * (1 + 0.07 + gstPct));
    document.getElementById('input-apr').value = Math.round(apr);
    
    const agreement = carpet * apr;
    document.getElementById('disp-agreement').innerText = Math.round(agreement).toLocaleString();
    document.getElementById('disp-stamp').innerText = Math.round(agreement * 0.07).toLocaleString();
    document.getElementById('disp-gst').innerText = Math.round(agreement * gstPct).toLocaleString();
}

function downloadPDF() {
    const element = document.getElementById('pdf-content');
    const opt = {
        margin: 0.5,
        filename: `Royal_Keys_CostSheet_${document.getElementById('cust-name').value || 'Unit'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
