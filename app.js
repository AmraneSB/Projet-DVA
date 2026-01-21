let currentData = [];
let vizCount = 0;
const { jsPDF } = window.jspdf;

document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "csv") {
    parseCSV(file);
  } else if (extension === "xlsx" || extension === "xls") {
    parseExcel(file);
  } else {
    alert("Format non supporté");
  }
}

function parseCSV(file) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      currentData = results.data;
      setupControls(currentData);
    }
  });
}

function parseExcel(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    currentData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    setupControls(currentData);
  };

  reader.readAsArrayBuffer(file);
}

function setupControls(data) {
  const controls = document.getElementById("controls");
  const columnSelect = document.getElementById("columnSelect");

  controls.style.display = "block";
  columnSelect.innerHTML = "";

  const numericColumns = Object.keys(data[0]).filter(col => {
    let total = 0;
    let numeric = 0;

    data.forEach(row => {
      if (row[col] !== "" && row[col] !== null) {
        total++;
        if (!isNaN(Number(row[col]))) numeric++;
      }
    });

    return total > 0 && numeric / total > 0.7;
  });

  if (numericColumns.length === 0) {
    alert("Aucune colonne numérique détectée");
    return;
  }

  numericColumns.forEach(col => {
    const opt = document.createElement("option");
    opt.value = col;
    opt.textContent = col;
    columnSelect.appendChild(opt);
  });
}

function createChart(data, column, type) {
  vizCount++;

  const wrapper = document.createElement("div");
  const chartId = `chart-${vizCount}`;

  wrapper.innerHTML = `
    <h3>Visualisation #${vizCount} – ${type.toUpperCase()} (${column})</h3>
    <div id="${chartId}" style="height:400px;"></div>
    <button onclick="exportPNG('${chartId}')">Exporter PNG</button>
    <button onclick="exportPDF('${chartId}')">Exporter PDF</button>
    <button onclick="exportHTML('${chartId}')">Partager HTML</button>
  `;

  document.getElementById("visualizations").appendChild(wrapper);

  let trace;

  if (type === "pie") {
    trace = {
      labels: data.map((_, i) => `Ligne ${i + 1}`),
      values: data.map(row => row[column]),
      type: "pie"
    };
  } else {
    trace = {
      y: data.map(row => row[column]),
      type: type === "line" ? "scatter" : "bar",
      mode: type === "line" ? "lines+markers" : undefined
    };
  }

  document.getElementById("visualizations").scrollIntoView({ behavior: "smooth" });

  Plotly.newPlot(chartId, [trace], { title: `${column}` });
}

function exportPNG(chartId) {
  Plotly.toImage(chartId, { format: "png", width: 800, height: 600 })
    .then(dataUrl => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${chartId}.png`;
      a.click();
    });
}

function exportPDF(chartId) {
  Plotly.toImage(chartId, { format: "png", width: 800, height: 600 })
    .then(imgData => {
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 135);
      pdf.save(`${chartId}.pdf`);
    });
}

function exportHTML(chartId) {
  const chartDiv = document.getElementById(chartId);
  const chartData = chartDiv.data;
  const chartLayout = chartDiv.layout;

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Visualisation Plotly</title>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
  <div id="chart" style="width:100%;height:100vh;"></div>
  <script>
    Plotly.newPlot('chart', ${JSON.stringify(chartData)}, ${JSON.stringify(chartLayout)});
  </script>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${chartId}.html`;
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const column = document.getElementById("columnSelect").value;
  const type = document.getElementById("chartType").value;

  createChart(currentData, column, type);
});

// ====== CHATBOT IA ======
document.getElementById("chatBtn").addEventListener("click", async () => {
  const message = document.getElementById("chatInput").value;
  if (!message || currentData.length === 0) return;

  const columns = Object.keys(currentData[0]);
  let result;

  try {
    const response = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, columns })
    });
    result = await response.json();
  } catch (err) {
    document.getElementById("chatResponse").textContent = "IA : Impossible de lire la réponse";
    return;
  }

  if (!result || !result.column || !result.type) {
    document.getElementById("chatResponse").textContent = "IA : Réponse IA invalide";
    return;
  }

  document.getElementById("chatResponse").textContent = `IA : ${result.explanation}`;

  createChart(currentData, result.column, result.type);
});
