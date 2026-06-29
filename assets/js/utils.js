(function () {
  function seededRandom(seed) {
    let s = Number(seed) || 1;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function shuffle(array, seed) {
    const rand = seededRandom(seed);
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function isMissing(value) {
    return value === null || value === undefined || String(value).trim() === "" || String(value).toLowerCase() === "nan";
  }

  function toNumber(value) {
    if (isMissing(value)) return NaN;
    const normalized = String(value).replace(/,/g, "").trim();
    if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(normalized)) return Number(normalized);
    return NaN;
  }

  function mean(values) {
    const nums = values.filter(Number.isFinite);
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  }

  function median(values) {
    const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!nums.length) return 0;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  }

  function std(values) {
    const nums = values.filter(Number.isFinite);
    if (nums.length < 2) return 0;
    const m = mean(nums);
    return Math.sqrt(nums.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (nums.length - 1));
  }

  function mode(values) {
    const counts = new Map();
    values.filter((v) => !isMissing(v)).forEach((v) => counts.set(String(v), (counts.get(String(v)) || 0) + 1));
    let best = "Unknown";
    let max = -1;
    counts.forEach((count, value) => {
      if (count > max) {
        max = count;
        best = value;
      }
    });
    return best;
  }

  function unique(values) {
    return Array.from(new Set(values.map((v) => String(v))));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatNumber(value, digits) {
    if (!Number.isFinite(value)) return "";
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: digits === undefined ? 4 : digits });
  }

  function downloadText(filename, text, type) {
    const blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function rowsToCsv(rows) {
    if (!rows || !rows.length) return "";
    const columns = Object.keys(rows[0]);
    const escape = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return [columns.join(","), ...rows.map((row) => columns.map((col) => escape(row[col])).join(","))].join("\n");
  }

  function toast(message) {
    const node = document.getElementById("toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2600);
  }

  window.Utils = {
    seededRandom,
    shuffle,
    isMissing,
    toNumber,
    mean,
    median,
    std,
    mode,
    unique,
    clamp,
    formatNumber,
    downloadText,
    rowsToCsv,
    toast
  };
})();
