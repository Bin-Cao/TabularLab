(function () {
  function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/).find((line) => line.trim());
    if (!firstLine) return ",";
    const commas = (firstLine.match(/,/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    const semis = (firstLine.match(/;/g) || []).length;
    if (tabs >= commas && tabs >= semis) return "\t";
    if (semis > commas) return ";";
    return ",";
  }

  function parseDelimited(text) {
    const delimiter = detectDelimiter(text);
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"') {
        if (quoted && next === '"') {
          cell += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (char === delimiter && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i++;
        row.push(cell);
        if (row.some((value) => String(value).trim() !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    row.push(cell);
    if (row.some((value) => String(value).trim() !== "")) rows.push(row);
    if (rows.length < 2) return { columns: [], rows: [], delimiter };
    const rawHeaders = rows[0].map((h, i) => String(h || `column_${i + 1}`).trim() || `column_${i + 1}`);
    const seen = new Map();
    const columns = rawHeaders.map((header) => {
      const count = seen.get(header) || 0;
      seen.set(header, count + 1);
      return count ? `${header}_${count + 1}` : header;
    });
    const objects = rows.slice(1).map((values) => {
      const obj = {};
      columns.forEach((column, index) => {
        obj[column] = values[index] === undefined ? "" : values[index];
      });
      return obj;
    });
    return { columns, rows: objects, delimiter };
  }

  function rowsFromMatrix(matrix) {
    const clean = matrix.filter((row) => row && row.some((value) => !Utils.isMissing(value)));
    if (clean.length < 2) return { columns: [], rows: [] };
    const rawHeaders = clean[0].map((h, i) => String(h || `column_${i + 1}`).trim() || `column_${i + 1}`);
    const seen = new Map();
    const columns = rawHeaders.map((header) => {
      const count = seen.get(header) || 0;
      seen.set(header, count + 1);
      return count ? `${header}_${count + 1}` : header;
    });
    const rows = clean.slice(1).map((values) => {
      const obj = {};
      columns.forEach((column, index) => {
        obj[column] = values[index] === undefined || values[index] === null ? "" : values[index];
      });
      return obj;
    });
    return { columns, rows };
  }

  function parseWorkbook(arrayBuffer) {
    const xlsx = (window.XLSX && window.XLSX.read) ? window.XLSX : (globalThis.XLSX && globalThis.XLSX.read ? globalThis.XLSX : null);
    if (!xlsx) throw new Error("xlsx_library_missing");
    const workbook = xlsx.read(arrayBuffer, { type: "array", cellDates: true });
    const firstSheet = workbook.SheetNames[0];
    const matrix = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1, raw: false, defval: "" });
    return { ...rowsFromMatrix(matrix), sheetName: firstSheet };
  }

  function inferSchema(rows, columns) {
    return columns.map((column) => {
      const values = rows.map((row) => row[column]);
      const present = values.filter((v) => !Utils.isMissing(v));
      const nums = present.map(Utils.toNumber).filter(Number.isFinite);
      const numericRatio = present.length ? nums.length / present.length : 0;
      const isNumeric = present.length > 0 && numericRatio >= 0.85;
      const numericValues = values.map(Utils.toNumber);
      return {
        name: column,
        type: isNumeric ? "numeric" : "categorical",
        missing: values.filter(Utils.isMissing).length,
        unique: Utils.unique(present).length,
        mean: isNumeric ? Utils.mean(numericValues) : null,
        median: isNumeric ? Utils.median(numericValues) : null,
        q1: isNumeric ? quantile(numericValues, 0.25) : null,
        q3: isNumeric ? quantile(numericValues, 0.75) : null,
        std: isNumeric ? Utils.std(numericValues) : null,
        min: isNumeric ? Math.min(...numericValues.filter(Number.isFinite)) : null,
        max: isNumeric ? Math.max(...numericValues.filter(Number.isFinite)) : null,
        mode: Utils.mode(values),
        missingRate: values.length ? values.filter(Utils.isMissing).length / values.length : 0,
        samples: Utils.unique(present).slice(0, 5)
      };
    });
  }

  function quantile(values, q) {
    const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!nums.length) return null;
    const pos = (nums.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return nums[base + 1] === undefined ? nums[base] : nums[base] + rest * (nums[base + 1] - nums[base]);
  }

  function buildPreprocessor(rows, columns, options) {
    const schema = inferSchema(rows, columns);
    const byName = Object.fromEntries(schema.map((item) => [item.name, item]));
    const featureNames = [];
    const categoryMaps = {};
    columns.forEach((column) => {
      const info = byName[column];
      if (info.type === "numeric") {
        featureNames.push(column);
      } else {
        const categories = Utils.unique(rows.map((row) => normalizeValue(row[column], info, options))).sort();
        if (options.encodingStrategy === "ordinal") {
          categoryMaps[column] = new Map(categories.map((value, index) => [value, index + 1]));
          featureNames.push(column);
        } else {
          categoryMaps[column] = new Map(categories.map((value, index) => [value, index]));
          categories.forEach((value) => featureNames.push(`${column}=${value}`));
        }
      }
    });
    const numericStats = {};
    schema.forEach((info) => {
      if (info.type === "numeric") {
        numericStats[info.name] = {
          mean: Number.isFinite(info.mean) ? info.mean : 0,
          median: Number.isFinite(info.median) ? info.median : 0,
          std: info.std || 1,
          min: Number.isFinite(info.min) ? info.min : 0,
          max: Number.isFinite(info.max) ? info.max : 0
        };
      }
    });
    return { schema, byName, columns, featureNames, categoryMaps, numericStats, options };
  }

  function normalizeValue(value, info, options) {
    if (info.type === "numeric") {
      const num = Utils.toNumber(value);
      if (Number.isFinite(num)) return num;
      if (options.missingStrategy === "median_mode") return info.median || 0;
      if (options.missingStrategy === "zero_unknown") return 0;
      return info.mean || 0;
    }
    if (!Utils.isMissing(value)) return String(value).trim();
    if (options.missingStrategy === "zero_unknown") return "Unknown";
    return info.mode || "Unknown";
  }

  function transformRows(rows, preprocessor) {
    return rows.map((row) => transformRow(row, preprocessor));
  }

  function transformRow(row, preprocessor) {
    const vector = [];
    preprocessor.columns.forEach((column) => {
      const info = preprocessor.byName[column];
      const value = normalizeValue(row[column], info, preprocessor.options);
      if (info.type === "numeric") {
        const stats = preprocessor.numericStats[column];
        const scale = stats.std || 1;
        vector.push((Number(value) - stats.mean) / scale);
      } else if (preprocessor.options.encodingStrategy === "ordinal") {
        vector.push(preprocessor.categoryMaps[column].get(String(value)) || 0);
      } else {
        const map = preprocessor.categoryMaps[column];
        const selected = map.get(String(value));
        for (let i = 0; i < map.size; i++) vector.push(i === selected ? 1 : 0);
      }
    });
    return vector;
  }

  function getTarget(rows, targetColumn, task) {
    const values = rows.map((row) => row[targetColumn]);
    if (task === "regression") return values.map(Utils.toNumber);
    const labels = Utils.unique(values.filter((v) => !Utils.isMissing(v))).sort();
    const labelToIndex = new Map(labels.map((label, index) => [label, index]));
    return {
      y: values.map((value) => labelToIndex.get(String(value))),
      labels,
      labelToIndex
    };
  }

  function splitRows(rows, testSize, seed) {
    const indexes = Utils.shuffle(rows.map((_, index) => index), seed);
    const testCount = Math.max(1, Math.round(rows.length * testSize));
    const testIndexes = new Set(indexes.slice(0, testCount));
    const train = [];
    const test = [];
    rows.forEach((row, index) => (testIndexes.has(index) ? test : train).push(row));
    return { train, test };
  }

  window.TabularData = {
    parseDelimited,
    parseWorkbook,
    inferSchema,
    buildPreprocessor,
    transformRows,
    transformRow,
    getTarget,
    splitRows
  };
})();
