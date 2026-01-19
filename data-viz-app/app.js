let vizCount = 0;

document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: (results) => {
      generateVisualizations(results.data);
    }
  });
}

function generateVisualizations(data) {
  const container = document.getElementById("visualizations");
  container.innerHTML = "";

  const numericColumns = Object.keys(data[0]).filter(col =>
    data.every(row => typeof row[col] === "number")
  );

  if (numericColumns.length === 0) {
    alert("Aucune colonne numérique détectée");
    return;
  }

  numericColumns.forEach(column => {
    vizCount++;
    const div = document.createElement("div");
    div.id = `viz-${vizCount}`;
    container.appendChild(div);

    Plotly.newPlot(div.id, [{
      y: data.map(row => row[column]),
      type: "bar"
    }], {
      title: `Visualisation #${vizCount} – ${column}`
    });
  });
}
