let inventory = [];
// Load your JSON data
fetch('inventory.json').then(res => res.json()).then(data => inventory = data);

function checkPass() {
    const pass = document.getElementById('pass-input').value;
    if (pass === "Admin@123") { // Set your single password here
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
    } else {
        alert("Incorrect Password");
    }
}

function loadUnit() {
    const unitNo = document.getElementById('unit-search').value;
    const data = inventory.find(u => u.unit === unitNo);
    
    if (data) {
        document.getElementById('disp-type').innerText = data.type;
        document.getElementById('disp-carpet').innerText = data.carpet;
        document.getElementById('input-apr').value = data.apr;
        document.getElementById('gst-rate').innerText = data.type === 'Residential' ? 5 : 12;
        updateByAPR();
    } else {
        alert("Unit not found in inventory");
    }
}

function updateByAPR() {
    const carpet = parseFloat(document.getElementById('disp-carpet').innerText);
    const apr = parseFloat(document.getElementById('input-apr').value) || 0;
    const gstPct = parseFloat(document.getElementById('gst-rate').innerText) / 100;

    const agreement = carpet * apr;
    const stamp = Math.round(agreement * 0.07);
    const reg = 30000;
    const gst = Math.round(agreement * gstPct);
    const total = agreement + stamp + reg + gst;

    document.getElementById('disp-agreement').innerText = agreement.toLocaleString();
    document.getElementById('disp-stamp').innerText = stamp.toLocaleString();
    document.getElementById('disp-gst').innerText = gst.toLocaleString();
    document.getElementById('input-total').value = Math.round(total);
}

function updateByTotal() {
    const total = parseFloat(document.getElementById('input-total').value) || 0;
    const carpet = parseFloat(document.getElementById('disp-carpet').innerText);
    const gstPct = parseFloat(document.getElementById('gst-rate').innerText) / 100;

    // Derived Formula: Total = (Carpet * APR) + (Carpet * APR * 0.07) + 30000 + (Carpet * APR * GST%)
    // Total - 30000 = Carpet * APR * (1 + 0.07 + GST%)
    const apr = (total - 30000) / (carpet * (1 + 0.07 + gstPct));
    
    document.getElementById('input-apr').value = Math.round(apr);
    
    // Recalculate intermediate fields
    const agreement = carpet * apr;
    document.getElementById('disp-agreement').innerText = Math.round(agreement).toLocaleString();
    document.getElementById('disp-stamp').innerText = Math.round(agreement * 0.07).toLocaleString();
    document.getElementById('disp-gst').innerText = Math.round(agreement * gstPct).toLocaleString();
}
