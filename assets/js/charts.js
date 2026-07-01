(function () {
  const DEFAULT_STYLE = {
    background: "#fbfcfd",
    textColor: "#1d2530",
    mutedColor: "#657386",
    gridColor: "#e5ebf1",
    frameColor: "#d2dbe5",
    axisColor: "#8b99aa",
    pointStroke: "#ffffff",
    referenceColor: "#b84d3a",
    fontFamily: "Arial, sans-serif",
    titleSize: 30,
    labelSize: 18,
    tickSize: 16,
    valueSize: 15,
    pointSize: 5,
    xLabelOffset: 40,
    yLabelOffset: 40,
    xTickOffset: 20,
    yTickOffset: 20,
    xLabelAngle: 36,
    yLabelAngle: 0,
    matrixValueSize: 18,
    matrixValueColor: "#1d2530",
    correlationMaxFeatures: 14,
    correlationStyle: "blueRed",
    palette: ["#0f766e", "#dc5f3d", "#2563eb", "#b7791f", "#7c3aed", "#15803d", "#db2777", "#475569"]
  };

  function styleOptions(options) {
    const merged = Object.assign({}, DEFAULT_STYLE, options || {});
    merged.palette = Array.isArray(merged.palette) && merged.palette.length ? merged.palette : DEFAULT_STYLE.palette;
    return merged;
  }

  function setup(canvas, options) {
    const ctx = canvas.__svg ? new SvgContext(canvas.width, canvas.height) : canvas.getContext("2d");
    const style = styleOptions(options);
    ctx.__style = style;
    canvas.__ctx = ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return ctx;
  }

  function palette(index, style) {
    const colors = (style && style.palette) || DEFAULT_STYLE.palette;
    return colors[index % colors.length];
  }

  function font(weight, size, style) {
    return `${weight ? `${weight} ` : ""}${size}px ${(style && style.fontFamily) || DEFAULT_STYLE.fontFamily}`;
  }

  function drawAxes(ctx, w, h, title, xLabel, yLabel) {
    const style = ctx.__style || DEFAULT_STYLE;
    drawGrid(ctx, 82, 56, w - 36, h - 70);
    ctx.strokeStyle = style.axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(82, h - 70);
    ctx.lineTo(w - 36, h - 70);
    ctx.moveTo(82, 56);
    ctx.lineTo(82, h - 70);
    ctx.stroke();
    ctx.fillStyle = style.textColor;
    ctx.font = font(700, style.titleSize, style);
    ctx.fillText(title, 82, 34);
    ctx.font = font(600, style.labelSize, style);
    ctx.fillText(xLabel || "", w / 2 - 40, h - Math.max(10, 64 - style.xLabelOffset));
    ctx.save();
    ctx.translate(Math.max(10, 68 - style.yLabelOffset), h / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel || "", 0, 0);
    ctx.restore();
  }

  function drawGrid(ctx, left, top, right, bottom) {
    const style = ctx.__style || DEFAULT_STYLE;
    ctx.save();
    ctx.strokeStyle = style.gridColor;
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
    ctx.strokeStyle = style.frameColor;
    ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.restore();
  }

  function extent(values) {
    const nums = values.map(Utils.toNumber).filter(Number.isFinite);
    return { min: Math.min(...nums), max: Math.max(...nums), values: nums };
  }

  function histogram(canvas, rows, column, options) {
    const ctx = setup(canvas, options);
    const style = ctx.__style;
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
      ctx.fillStyle = palette(i, style);
      ctx.fillRect(84 + i * barW, h - 70 - barH, Math.max(2, barW - 4), barH);
    });
    drawTicks(ctx, ex.min, ex.max, 82, h - 70, w - 36, h - 70, false);
    drawTicks(ctx, 0, maxCount, 82, h - 70, 82, 56, true);
  }

  function violin(canvas, rows, column, options) {
    const ctx = setup(canvas, options);
    const style = ctx.__style;
    const w = canvas.width;
    const h = canvas.height;
    const ex = extent(rows.map((r) => r[column]));
    if (!ex.values.length) return;
    drawAxes(ctx, w, h, `Violin: ${column}`, column, "Count");
    const bins = 36;
    const counts = new Array(bins).fill(0);
    const span = ex.max - ex.min || 1;
    ex.values.forEach((v) => {
      const idx = Math.min(bins - 1, Math.floor(((v - ex.min) / span) * bins));
      counts[idx]++;
    });
    const smooth = counts.map((count, i) => {
      const prev = counts[Math.max(0, i - 1)];
      const next = counts[Math.min(bins - 1, i + 1)];
      return (prev + count * 2 + next) / 4;
    });
    const maxCount = Math.max(...smooth) || 1;
    const left = 82;
    const right = w - 36;
    const baseline = h - 70;
    const plotW = right - left;
    const maxH = h - 150;
    const topPoints = smooth.map((count, i) => {
      const x = left + ((i + 0.5) / bins) * plotW;
      const y = baseline - (count / maxCount) * maxH;
      return [x, y];
    });
    const bottomPoints = smooth.map((count, i) => {
      const x = left + ((i + 0.5) / bins) * plotW;
      const y = baseline + Math.min(34, ((count / maxCount) * maxH) / 6);
      return [x, y];
    }).reverse();
    ctx.fillStyle = palette(0, style);
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    topPoints.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    bottomPoints.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = style.axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    topPoints.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
    ctx.strokeStyle = style.referenceColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, baseline);
    ctx.lineTo(right, baseline);
    ctx.stroke();
    drawTicks(ctx, ex.min, ex.max, left, baseline, right, baseline, false);
    drawTicks(ctx, 0, maxCount, left, baseline, left, 56, true);
  }

  function scatter(canvas, rows, xColumn, yColumn, colorColumn, options) {
    const ctx = setup(canvas, options);
    const style = ctx.__style;
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
      ctx.fillStyle = palette(colorIndex, style);
      ctx.globalAlpha = 0.76;
      ctx.beginPath();
      ctx.arc(px, py, style.pointSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = style.pointStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    drawTicks(ctx, x.min, x.max, 82, h - 70, w - 36, h - 70, false);
    drawTicks(ctx, y.min, y.max, 82, h - 70, 82, 56, true);
  }

  function correlation(canvas, rows, numericColumns, options) {
    const ctx = setup(canvas, options);
    const style = ctx.__style;
    const w = canvas.width;
    const h = canvas.height;
    const maxFeatures = Math.max(2, Math.min(40, Math.round(style.correlationMaxFeatures || 14)));
    const cols = numericColumns.slice(0, maxFeatures);
    if (!cols.length) return;
    ctx.fillStyle = style.textColor;
    ctx.font = font(700, style.titleSize, style);
    ctx.fillText("Correlation Heatmap", 44, 36);
    const size = Math.min((w - 260) / cols.length, (h - 130) / cols.length);
    const left = 180;
    const top = 72;
    cols.forEach((a, i) => {
      cols.forEach((b, j) => {
        const c = corr(rows.map((r) => Utils.toNumber(r[a])), rows.map((r) => Utils.toNumber(r[b])));
        ctx.fillStyle = corrColor(c, style.correlationStyle);
        ctx.fillRect(left + j * size, top + i * size, size - 1, size - 1);
        ctx.fillStyle = Math.abs(c) > 0.55 ? "#fff" : style.textColor;
        ctx.font = font(600, style.valueSize, style);
        ctx.fillText(Utils.formatNumber(c, 2), left + j * size + 6, top + i * size + size / 2 + 4);
      });
    });
    ctx.fillStyle = style.textColor;
    ctx.font = font(600, style.tickSize, style);
    cols.forEach((col, i) => {
      drawAngledText(ctx, col.slice(0, 18), 18, top + i * size + size / 2 + 4, style.yLabelAngle);
      ctx.save();
      ctx.translate(left + i * size + size / 2, top + cols.length * size + 18);
      ctx.rotate((style.xLabelAngle * Math.PI) / 180);
      ctx.fillText(col.slice(0, 18), 0, 0);
      ctx.restore();
    });
  }

  function targetPlot(canvas, rows, xColumn, targetColumn, task, options) {
    if (task === "regression") {
      scatter(canvas, rows, xColumn, targetColumn, null, options);
      return;
    }
    const ctx = setup(canvas, options);
    const style = ctx.__style;
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
        ctx.fillStyle = palette(j, style);
        ctx.fillRect(84 + i * band, yBase - height, Math.max(4, band - 6), height);
        yBase -= height;
      });
      ctx.fillStyle = style.textColor;
      ctx.font = font(600, style.valueSize, style);
      ctx.save();
      ctx.translate(88 + i * band, h - 52);
      ctx.rotate((style.xLabelAngle * Math.PI) / 180);
      ctx.fillText(key.slice(0, 14), 0, 0);
      ctx.restore();
    });
  }

  function predictionScatter(canvas, rows, actualColumn, predictionColumn, title, options) {
    const ctx = setup(canvas, options);
    const style = ctx.__style;
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
    ctx.strokeStyle = style.axisColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, size, size);
    ctx.fillStyle = style.textColor;
    ctx.font = font(700, style.titleSize, style);
    ctx.fillText(title || "Actual vs Predicted", left, 36);
    ctx.font = font(600, style.labelSize, style);
    ctx.fillText("Actual", left + size / 2 - 28, bottom + style.xLabelOffset + 8);
    ctx.save();
    ctx.translate(left - style.yLabelOffset - 16, top + size / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Predicted", 0, 0);
    ctx.restore();
    ctx.strokeStyle = style.referenceColor;
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
      ctx.fillStyle = palette(i, style);
      ctx.globalAlpha = 0.78;
      ctx.beginPath();
      ctx.arc(px, py, style.pointSize + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = style.pointStroke;
      ctx.lineWidth = 1.7;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    drawTicks(ctx, min, max, left, bottom, right, bottom, false);
    drawTicks(ctx, min, max, left, bottom, left, top, true);
  }

  function confusionMatrix(canvas, rows, actualColumn, predictionColumn, title, options) {
    const ctx = setup(canvas, options);
    const style = ctx.__style;
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
    ctx.fillStyle = style.textColor;
    ctx.font = font(700, style.titleSize, style);
    ctx.fillText(title || "Confusion Matrix", 44, 38);
    const max = Math.max(...matrix.flat(), 1);
    const size = Math.min((w - 290) / labels.length, (h - 170) / labels.length);
    const left = 210;
    const top = 82;
    matrix.forEach((row, i) => {
      row.forEach((value, j) => {
        ctx.fillStyle = heatColor(value / max, style.correlationStyle);
        roundRect(ctx, left + j * size, top + i * size, size - 3, size - 3, 6);
        ctx.fill();
        ctx.fillStyle = style.matrixValueColor || (value / max > 0.5 ? "#fff" : style.textColor);
        ctx.font = font(700, style.matrixValueSize, style);
        ctx.fillText(String(value), left + j * size + size / 2 - 8, top + i * size + size / 2 + 6);
      });
    });
    ctx.fillStyle = style.textColor;
    ctx.font = font(600, style.tickSize + 1, style);
    labels.forEach((label, i) => {
      drawAngledText(ctx, label.slice(0, 18), 20, top + i * size + size / 2 + 6, style.yLabelAngle);
      ctx.save();
      ctx.translate(left + i * size + 8, top + labels.length * size + 24);
      ctx.rotate((style.xLabelAngle * Math.PI) / 180);
      ctx.fillText(label.slice(0, 18), 0, 0);
      ctx.restore();
    });
    ctx.font = font(700, style.labelSize, style);
    ctx.fillText("Actual", 20, top - 16);
    ctx.fillText("Predicted", left, top + labels.length * size + style.xLabelOffset + 46);
  }

  function clusterScatter(canvas, rows, xColumn, yColumn, clusterColumn, title, options) {
    const ctx = setup(canvas, options);
    const style = ctx.__style;
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
      ctx.fillStyle = palette(Number.isFinite(cluster) ? cluster + 1 : 0, style);
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.arc(px, py, style.pointSize + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = style.pointStroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    drawTicks(ctx, x.min, x.max, 82, h - 70, w - 36, h - 70, false);
    drawTicks(ctx, y.min, y.max, 82, h - 70, 82, 56, true);
  }


  function drawTicks(ctx, min, max, x1, y1, x2, y2, vertical) {
    const style = ctx.__style || DEFAULT_STYLE;
    ctx.fillStyle = style.mutedColor;
    ctx.font = font(600, style.tickSize, style);
    for (let i = 0; i <= 4; i++) {
      const value = min + ((max - min) * i) / 4;
      if (vertical) {
        const y = y1 - ((y1 - y2) * i) / 4;
        ctx.fillText(Utils.formatNumber(value, 2), Math.max(8, 40 - style.yTickOffset), y + 4);
      } else {
        const x = x1 + ((x2 - x1) * i) / 4;
        ctx.fillText(Utils.formatNumber(value, 2), x - 16, y1 + style.xTickOffset);
      }
    }
  }

  function drawAngledText(ctx, text, x, y, angle) {
    if (!angle) {
      ctx.fillText(text, x, y);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
    ctx.restore();
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

  function corrColor(value, scheme) {
    const v = Utils.clamp(value, -1, 1);
    if (scheme === "gray") {
      const g = Math.round(245 - Math.abs(v) * 145);
      return `rgb(${g}, ${g}, ${g})`;
    }
    if (scheme === "tealOrange") {
      if (v >= 0) return mixRgb([244, 252, 250], [15, 118, 110], v);
      return mixRgb([255, 249, 240], [220, 95, 61], Math.abs(v));
    }
    if (scheme === "purpleGreen") {
      if (v >= 0) return mixRgb([247, 245, 255], [124, 58, 237], v);
      return mixRgb([240, 253, 244], [21, 128, 61], Math.abs(v));
    }
    if (v >= 0) {
      const a = Math.round(245 - v * 135);
      const b = Math.round(247 - v * 100);
      return `rgb(${a}, ${b}, 255)`;
    }
    const p = Math.abs(v);
    return `rgb(255, ${Math.round(245 - p * 120)}, ${Math.round(235 - p * 150)})`;
  }

  function mixRgb(from, to, amount) {
    const v = Utils.clamp(amount, 0, 1);
    return `rgb(${from.map((base, i) => Math.round(base + (to[i] - base) * v)).join(", ")})`;
  }

  function heatColor(value, scheme) {
    const v = Utils.clamp(value, 0, 1);
    if (scheme === "gray") return mixRgb([245, 247, 249], [88, 100, 118], v);
    if (scheme === "tealOrange") return mixRgb([245, 252, 250], [15, 118, 110], v);
    if (scheme === "purpleGreen") return mixRgb([247, 245, 255], [124, 58, 237], v);
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

  function saveSvg(drawFn, filename, width, height) {
    const target = { __svg: true, width: width || 1200, height: height || 720 };
    drawFn(target);
    const ctx = target.__ctx;
    if (!ctx) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ctx.toSvg())}`;
    link.click();
  }

  function SvgContext(width, height) {
    this.width = width;
    this.height = height;
    this.nodes = [];
    this.path = [];
    this.stack = [];
    this.transforms = [];
    this.fillStyle = "#000";
    this.strokeStyle = "#000";
    this.lineWidth = 1;
    this.globalAlpha = 1;
    this.font = "16px Arial, sans-serif";
    this.lineDash = [];
  }

  SvgContext.prototype.clearRect = function () {};
  SvgContext.prototype.save = function () {
    this.stack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      globalAlpha: this.globalAlpha,
      font: this.font,
      lineDash: this.lineDash.slice(),
      transforms: this.transforms.slice()
    });
  };
  SvgContext.prototype.restore = function () {
    const state = this.stack.pop();
    if (!state) return;
    Object.assign(this, state);
  };
  SvgContext.prototype.translate = function (x, y) {
    this.transforms.push(`translate(${num(x)} ${num(y)})`);
  };
  SvgContext.prototype.rotate = function (radians) {
    this.transforms.push(`rotate(${num((radians * 180) / Math.PI)})`);
  };
  SvgContext.prototype.setLineDash = function (dash) {
    this.lineDash = dash || [];
  };
  SvgContext.prototype.beginPath = function () {
    this.path = [];
  };
  SvgContext.prototype.moveTo = function (x, y) {
    this.path.push(`M ${num(x)} ${num(y)}`);
  };
  SvgContext.prototype.lineTo = function (x, y) {
    this.path.push(`L ${num(x)} ${num(y)}`);
  };
  SvgContext.prototype.arcTo = function (x1, y1) {
    this.lineTo(x1, y1);
  };
  SvgContext.prototype.closePath = function () {
    this.path.push("Z");
  };
  SvgContext.prototype.arc = function (x, y, r) {
    this.path.push(`M ${num(x - r)} ${num(y)} A ${num(r)} ${num(r)} 0 1 0 ${num(x + r)} ${num(y)} A ${num(r)} ${num(r)} 0 1 0 ${num(x - r)} ${num(y)}`);
  };
  SvgContext.prototype.fill = function () {
    this.nodes.push(`<path d="${this.path.join(" ")}" fill="${escapeAttr(this.fillStyle)}"${styleAttrs(this, false)} />`);
  };
  SvgContext.prototype.stroke = function () {
    this.nodes.push(`<path d="${this.path.join(" ")}" fill="none" stroke="${escapeAttr(this.strokeStyle)}"${styleAttrs(this, true)} />`);
  };
  SvgContext.prototype.fillRect = function (x, y, w, h) {
    this.nodes.push(`<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" fill="${escapeAttr(this.fillStyle)}"${styleAttrs(this, false)} />`);
  };
  SvgContext.prototype.strokeRect = function (x, y, w, h) {
    this.nodes.push(`<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" fill="none" stroke="${escapeAttr(this.strokeStyle)}"${styleAttrs(this, true)} />`);
  };
  SvgContext.prototype.fillText = function (text, x, y) {
    const parsed = parseFont(this.font);
    this.nodes.push(`<text x="${num(x)}" y="${num(y)}" fill="${escapeAttr(this.fillStyle)}" font-family="${escapeAttr(parsed.family)}" font-size="${num(parsed.size)}" font-weight="${escapeAttr(parsed.weight)}"${styleAttrs(this, false)}>${escapeXml(text)}</text>`);
  };
  SvgContext.prototype.toSvg = function () {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">${this.nodes.join("")}</svg>`;
  };

  function styleAttrs(ctx, includeStroke) {
    const attrs = [];
    if (ctx.globalAlpha !== 1) attrs.push(`opacity="${num(ctx.globalAlpha)}"`);
    if (includeStroke) attrs.push(`stroke-width="${num(ctx.lineWidth)}"`);
    if (includeStroke && ctx.lineDash.length) attrs.push(`stroke-dasharray="${ctx.lineDash.map(num).join(" ")}"`);
    if (ctx.transforms.length) attrs.push(`transform="${ctx.transforms.join(" ")}"`);
    return attrs.length ? ` ${attrs.join(" ")}` : "";
  }

  function parseFont(value) {
    const match = String(value).match(/^(?:(\d+)\s+)?(\d+)px\s+(.+)$/);
    return {
      weight: match ? (match[1] || "400") : "400",
      size: match ? Number(match[2]) : 16,
      family: match ? match[3] : "Arial, sans-serif"
    };
  }

  function num(value) {
    return Number.isFinite(value) ? Number(value.toFixed(3)) : 0;
  }

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" }[char]));
  }

  function escapeAttr(value) {
    return escapeXml(value);
  }

  window.Charts = {
    histogram,
    violin,
    scatter,
    correlation,
    targetPlot,
    predictionScatter,
    confusionMatrix,
    clusterScatter,
    saveCanvas,
    saveSvg,
    styleOptions
  };
})();
