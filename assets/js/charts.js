(function () {
  function setup(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fbfcfd";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return ctx;
  }

  function palette(index) {
    const colors = ["#0f766e", "#dc5f3d", "#2563eb", "#b7791f", "#7c3aed", "#15803d", "#db2777", "#475569"];
    return colors[index % colors.length];
  }

  function font(weight, size) {
    return `${weight ? `${weight} ` : ""}${size}px Arial, sans-serif`;
  }

  function drawAxes(ctx, w, h, title, xLabel, yLabel) {
    drawGrid(ctx, 82, 56, w - 36, h - 70);
    ctx.strokeStyle = "#8b99aa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(82, h - 70);
    ctx.lineTo(w - 36, h - 70);
    ctx.moveTo(82, 56);
    ctx.lineTo(82, h - 70);
    ctx.stroke();
    ctx.fillStyle = "#1d2530";
    ctx.font = font(700, 30);
    ctx.fillText(title, 82, 34);
    ctx.font = font(600, 18);
    ctx.fillText(xLabel || "", w / 2 - 40, h - 24);
    ctx.save();
    ctx.translate(28, h / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel || "", 0, 0);
    ctx.restore();
  }

  function drawGrid(ctx, left, top, right, bottom) {
    ctx.save();
    ctx.strokeStyle = "#e5ebf1";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = left + ((right - left) * i) / 5;
      const y = top + ((bottom - top) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#d2dbe5";
    ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.restore();
  }

  function extent(values) {
    const nums = values.map(Utils.toNumber).filter(Number.isFinite);
    return { min: Math.min(...nums), max: Math.max(...nums), values: nums };
  }

  function histogram(canvas, rows, column) {
    const ctx = setup(canvas);
    const w = canvas.width;
    const h = canvas.height;
    const ex = extent(rows.map((r) => r[column]));
    if (!ex.values.length) return;
    drawAxes(ctx, w, h, `Histogram: ${column}`, column, "Count");
    const bins = 18;
    const counts = new Array(bins).fill(0);
    const span = ex.max - ex.min || 1;
    ex.values.forEach((v) => {
      const idx = Math.min(bins - 1, Math.floor(((v - ex.min) / span) * bins));
      counts[idx]++;
    });
    const maxCount = Math.max(...counts) || 1;
    const plotW = w - 132;
    const plotH = h - 132;
    const barW = plotW / bins;
    counts.forEach((count, i) => {
      const barH = (count / maxCount) * plotH;
      ctx.fillStyle = palette(i);
      ctx.fillRect(84 + i * barW, h - 70 - barH, Math.max(2, barW - 4), barH);
    });
    drawTicks(ctx, ex.min, ex.max, 82, h - 70, w - 36, h - 70, false);
    drawTicks(ctx, 0, maxCount, 82, h - 70, 82, 56, true);
  }

  function scatter(canvas, rows, xColumn, yColumn, colorColumn) {
    const ctx = setup(canvas);
    const w = canvas.width;
    const h = canvas.height;
    const x = extent(rows.map((r) => r[xColumn]));
    const y = extent(rows.map((r) => r[yColumn]));
    if (!x.values.length || !y.values.length) return;
    drawAxes(ctx, w, h, `Scatter: ${xColumn} / ${yColumn}`, xColumn, yColumn);
    const xSpan = x.max - x.min || 1;
    const ySpan = y.max - y.min || 1;
    const categories = colorColumn ? Utils.unique(rows.map((r) => r[colorColumn])) : [];
    rows.forEach((row) => {
      const xv = Utils.toNumber(row[xColumn]);
      const yv = Utils.toNumber(row[yColumn]);
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) return;
      const px = 82 + ((xv - x.min) / xSpan) * (w - 118);
      const py = h - 70 - ((yv - y.min) / ySpan) * (h - 126);
      const colorIndex = colorColumn ? categories.indexOf(String(row[colorColumn])) : 0;
      ctx.fillStyle = palette(colorIndex);
      ctx.globalAlpha = 0.76;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    drawTicks(ctx, x.min, x.max, 82, h - 70, w - 36, h - 70, false);
    drawTicks(ctx, y.min, y.max, 82, h - 70, 82, 56, true);
  }

  function correlation(canvas, rows, numericColumns) {
    const ctx = setup(canvas);
    const w = canvas.width;
    const h = canvas.height;
    const cols = numericColumns.slice(0, 14);
    if (!cols.length) return;
    ctx.fillStyle = "#1d2530";
    ctx.font = font(700, 30);
    ctx.fillText("Correlation Heatmap", 44, 36);
    const size = Math.min((w - 260) / cols.length, (h - 130) / cols.length);
    const left = 180;
    const top = 72;
    cols.forEach((a, i) => {
      cols.forEach((b, j) => {
        const c = corr(rows.map((r) => Utils.toNumber(r[a])), rows.map((r) => Utils.toNumber(r[b])));
        ctx.fillStyle = corrColor(c);
        ctx.fillRect(left + j * size, top + i * size, size - 1, size - 1);
        ctx.fillStyle = Math.abs(c) > 0.55 ? "#fff" : "#1d2530";
        ctx.font = font(600, 15);
        ctx.fillText(Utils.formatNumber(c, 2), left + j * size + 6, top + i * size + size / 2 + 4);
      });
    });
    ctx.fillStyle = "#1d2530";
    ctx.font = font(600, 16);
    cols.forEach((col, i) => {
      ctx.fillText(col.slice(0, 18), 18, top + i * size + size / 2 + 4);
      ctx.save();
      ctx.translate(left + i * size + size / 2, top + cols.length * size + 18);
      ctx.rotate(Math.PI / 4);
      ctx.fillText(col.slice(0, 18), 0, 0);
      ctx.restore();
    });
  }

  function targetPlot(canvas, rows, xColumn, targetColumn, task) {
    if (task === "regression") {
      scatter(canvas, rows, xColumn, targetColumn);
      return;
    }
    const ctx = setup(canvas);
    const w = canvas.width;
    const h = canvas.height;
    drawAxes(ctx, w, h, `Target by ${xColumn}`, xColumn, "Count");
    const groups = new Map();
    rows.forEach((row) => {
      const key = String(row[xColumn]);
      const target = String(row[targetColumn]);
      if (!groups.has(key)) groups.set(key, new Map());
      groups.get(key).set(target, (groups.get(key).get(target) || 0) + 1);
    });
    const keys = Array.from(groups.keys()).slice(0, 16);
    const labels = Utils.unique(rows.map((r) => r[targetColumn]));
    const maxCount = Math.max(...keys.map((k) => Array.from(groups.get(k).values()).reduce((a, b) => a + b, 0)), 1);
    const band = (w - 132) / keys.length;
    keys.forEach((key, i) => {
      let yBase = h - 70;
      labels.forEach((label, j) => {
        const count = groups.get(key).get(String(label)) || 0;
        const height = (count / maxCount) * (h - 132);
        ctx.fillStyle = palette(j);
        ctx.fillRect(84 + i * band, yBase - height, Math.max(4, band - 6), height);
        yBase -= height;
      });
      ctx.fillStyle = "#1d2530";
      ctx.font = font(600, 15);
      ctx.save();
      ctx.translate(88 + i * band, h - 52);
      ctx.rotate(Math.PI / 5);
      ctx.fillText(key.slice(0, 14), 0, 0);
      ctx.restore();
    });
  }

  function predictionScatter(canvas, rows, actualColumn, predictionColumn, title) {
    const ctx = setup(canvas);
    const w = canvas.width;
    const h = canvas.height;
    if (!rows.length) return;
    const actualRaw = rows.map((row) => row[actualColumn]);
    const predictedRaw = rows.map((row) => row[predictionColumn]);
    const labels = Utils.unique(actualRaw.concat(predictedRaw).filter((value) => !Utils.isMissing(value)));
    const actual = actualRaw.map((value) => {
      const num = Utils.toNumber(value);
      return Number.isFinite(num) ? num : labels.indexOf(String(value));
    });
    const predicted = predictedRaw.map((value) => {
      const num = Utils.toNumber(value);
      return Number.isFinite(num) ? num : labels.indexOf(String(value));
    });
    const actualValues = actual.filter(Number.isFinite);
    const predictedValues = predicted.filter(Number.isFinite);
    if (!actualValues.length || !predictedValues.length) return;
    const actualMin = Math.min(...actualValues);
    const actualMax = Math.max(...actualValues);
    const predLo = quantile(predictedValues, 0.05);
    const predHi = quantile(predictedValues, 0.95);
    const actualSpan = actualMax - actualMin || 1;
    const min = Math.min(actualMin, predLo, actualMin - actualSpan * 0.04);
    const max = Math.max(actualMax, predHi, actualMax + actualSpan * 0.04);
    const span = max - min || 1;
    const size = Math.min(w - 170, h - 150);
    const left = Math.round((w - size) / 2);
    const top = 62;
    const bottom = top + size;
    const right = left + size;
    drawGrid(ctx, left, top, right, bottom);
    ctx.strokeStyle = "#9aa7b5";
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, size, size);
    ctx.fillStyle = "#1d2530";
    ctx.font = font(700, 30);
    ctx.fillText(title || "Actual vs Predicted", left, 36);
    ctx.font = font(600, 18);
    ctx.fillText("Actual", left + size / 2 - 28, bottom + 48);
    ctx.save();
    ctx.translate(left - 56, top + size / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Predicted", 0, 0);
    ctx.restore();
    ctx.strokeStyle = "#b84d3a";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(right, top);
    ctx.stroke();
    ctx.setLineDash([]);
    rows.forEach((_, i) => {
      if (!Number.isFinite(actual[i]) || !Number.isFinite(predicted[i])) return;
      const px = left + Utils.clamp((actual[i] - min) / span, 0, 1) * size;
      const py = bottom - Utils.clamp((predicted[i] - min) / span, 0, 1) * size;
      ctx.fillStyle = palette(i);
      ctx.globalAlpha = 0.78;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.7;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    drawTicks(ctx, min, max, left, bottom, right, bottom, false);
    drawTicks(ctx, min, max, left, bottom, left, top, true);
  }

  function confusionMatrix(canvas, rows, actualColumn, predictionColumn, title) {
    const ctx = setup(canvas);
    const w = canvas.width;
    const h = canvas.height;
    const labels = Utils.unique(rows.flatMap((row) => [row[actualColumn], row[predictionColumn]]).filter((value) => !Utils.isMissing(value))).slice(0, 16);
    if (!labels.length) return;
    const matrix = labels.map(() => labels.map(() => 0));
    rows.forEach((row) => {
      const a = labels.indexOf(String(row[actualColumn]));
      const p = labels.indexOf(String(row[predictionColumn]));
      if (a >= 0 && p >= 0) matrix[a][p]++;
    });
    ctx.fillStyle = "#1d2530";
    ctx.font = font(700, 30);
    ctx.fillText(title || "Confusion Matrix", 44, 38);
    const max = Math.max(...matrix.flat(), 1);
    const size = Math.min((w - 290) / labels.length, (h - 170) / labels.length);
    const left = 210;
    const top = 82;
    matrix.forEach((row, i) => {
      row.forEach((value, j) => {
        ctx.fillStyle = heatColor(value / max);
        roundRect(ctx, left + j * size, top + i * size, size - 3, size - 3, 6);
        ctx.fill();
        ctx.fillStyle = value / max > 0.5 ? "#fff" : "#1d2530";
        ctx.font = font(700, 18);
        ctx.fillText(String(value), left + j * size + size / 2 - 8, top + i * size + size / 2 + 6);
      });
    });
    ctx.fillStyle = "#1d2530";
    ctx.font = font(600, 17);
    labels.forEach((label, i) => {
      ctx.fillText(label.slice(0, 18), 20, top + i * size + size / 2 + 6);
      ctx.save();
      ctx.translate(left + i * size + 8, top + labels.length * size + 24);
      ctx.rotate(Math.PI / 5);
      ctx.fillText(label.slice(0, 18), 0, 0);
      ctx.restore();
    });
    ctx.font = font(700, 18);
    ctx.fillText("Actual", 20, top - 16);
    ctx.fillText("Predicted", left, top + labels.length * size + 86);
  }

  function clusterScatter(canvas, rows, xColumn, yColumn, clusterColumn, title) {
    const ctx = setup(canvas);
    const w = canvas.width;
    const h = canvas.height;
    const x = extent(rows.map((r) => r[xColumn]));
    const y = extent(rows.map((r) => r[yColumn]));
    if (!x.values.length || !y.values.length) return;
    drawAxes(ctx, w, h, title || "Cluster Projection", xColumn, yColumn);
    const xSpan = x.max - x.min || 1;
    const ySpan = y.max - y.min || 1;
    rows.forEach((row) => {
      const xv = Utils.toNumber(row[xColumn]);
      const yv = Utils.toNumber(row[yColumn]);
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) return;
      const cluster = Number(row[clusterColumn]);
      const px = 82 + ((xv - x.min) / xSpan) * (w - 118);
      const py = h - 70 - ((yv - y.min) / ySpan) * (h - 126);
      ctx.fillStyle = palette(Number.isFinite(cluster) ? cluster + 1 : 0);
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    drawTicks(ctx, x.min, x.max, 82, h - 70, w - 36, h - 70, false);
    drawTicks(ctx, y.min, y.max, 82, h - 70, 82, 56, true);
  }


  function drawTicks(ctx, min, max, x1, y1, x2, y2, vertical) {
    ctx.fillStyle = "#657386";
    ctx.font = font(600, 16);
    for (let i = 0; i <= 4; i++) {
      const value = min + ((max - min) * i) / 4;
      if (vertical) {
        const y = y1 - ((y1 - y2) * i) / 4;
        ctx.fillText(Utils.formatNumber(value, 2), 20, y + 4);
      } else {
        const x = x1 + ((x2 - x1) * i) / 4;
        ctx.fillText(Utils.formatNumber(value, 2), x - 16, y1 + 20);
      }
    }
  }

  function quantile(values, q) {
    const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!nums.length) return 0;
    const pos = (nums.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return nums[base + 1] === undefined ? nums[base] : nums[base] + rest * (nums[base + 1] - nums[base]);
  }

  function corr(a, b) {
    const pairs = a.map((v, i) => [v, b[i]]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (pairs.length < 2) return 0;
    const ax = pairs.map((p) => p[0]);
    const bx = pairs.map((p) => p[1]);
    const ma = Utils.mean(ax);
    const mb = Utils.mean(bx);
    let num = 0;
    let da = 0;
    let db = 0;
    pairs.forEach(([x, y]) => {
      num += (x - ma) * (y - mb);
      da += Math.pow(x - ma, 2);
      db += Math.pow(y - mb, 2);
    });
    return da && db ? num / Math.sqrt(da * db) : 0;
  }

  function corrColor(value) {
    const v = Utils.clamp(value, -1, 1);
    if (v >= 0) {
      const a = Math.round(245 - v * 135);
      const b = Math.round(247 - v * 100);
      return `rgb(${a}, ${b}, 255)`;
    }
    const p = Math.abs(v);
    return `rgb(255, ${Math.round(245 - p * 120)}, ${Math.round(235 - p * 150)})`;
  }

  function heatColor(value) {
    const v = Utils.clamp(value, 0, 1);
    return `rgb(${Math.round(236 - v * 110)}, ${Math.round(245 - v * 150)}, ${Math.round(250 - v * 170)})`;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function saveCanvas(canvas, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  window.Charts = {
    histogram,
    scatter,
    correlation,
    targetPlot,
    predictionScatter,
    confusionMatrix,
    clusterScatter,
    saveCanvas
  };
})();
