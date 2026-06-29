(function () {
  function csv(rows) {
    const columns = Object.keys(rows[0]);
    const escape = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n");
  }

  function alloyStrength() {
    const rows = [];
    const families = ["Al alloy", "Ti alloy", "Steel", "Ni superalloy", "Mg alloy"];
    const processes = ["cast", "wrought", "additive", "annealed", "aged"];
    for (let i = 1; i <= 90; i++) {
      const family = families[i % families.length];
      const process = processes[i % processes.length];
      const grain = +(4 + (i * 3 % 70) * 0.7).toFixed(2);
      const temp = 420 + (i * 17) % 620;
      const aging = +((i * 5) % 36 + 1).toFixed(1);
      const precip = +(0.02 + (i % 18) * 0.011).toFixed(3);
      const base = { "Al alloy": 240, "Ti alloy": 760, Steel: 620, "Ni superalloy": 930, "Mg alloy": 180 }[family];
      const bonus = { cast: -45, wrought: 35, additive: 20, annealed: -20, aged: 60 }[process];
      rows.push({
        yield_strength_mpa: +(base + bonus + precip * 980 - grain * 1.8 + aging * 3.4 - Math.abs(temp - 760) * 0.08 + (i % 9) * 5).toFixed(1),
        alloy_family: family,
        process_route: process,
        Al_wt_pct: family === "Al alloy" ? Math.max(0, 85 - (i % 20) * 2) : 2 + i % 7,
        Ti_wt_pct: family === "Ti alloy" ? 70 + i % 12 : 1 + i % 5,
        Fe_wt_pct: family === "Steel" ? 78 + i % 14 : 3 + i % 8,
        Ni_wt_pct: family === "Ni superalloy" ? 60 + i % 15 : 2 + i % 6,
        Mg_wt_pct: family === "Mg alloy" ? 88 - i % 18 : 1 + i % 4,
        grain_size_um: grain,
        solution_temp_c: temp,
        aging_time_h: aging,
        precipitate_fraction: precip
      });
    }
    return csv(rows);
  }

  function materialClass() {
    const rows = [];
    for (let i = 1; i <= 100; i++) {
      const density = +(1.6 + (i * 13 % 72) * 0.11).toFixed(3);
      const modulus = +(35 + (i * 19 % 180) * 1.1).toFixed(2);
      const conductivity = +(2 + (i * 23 % 320) * 0.7).toFixed(2);
      const melting = 520 + (i * 29) % 1250;
      let label = "engineering_alloy";
      if (conductivity > 145 && density < 5.2) label = "conductive_metal";
      else if (modulus > 155 && melting > 1250) label = "structural_ceramic";
      else if (density < 2.8 && modulus < 95) label = "polymer_composite";
      rows.push({ material_class: label, density_g_cm3: density, elastic_modulus_gpa: modulus, electrical_conductivity_ms_m: conductivity, melting_point_c: melting, oxidation_resistance: ["low", "medium", "high"][i % 3], crystal_structure: ["FCC", "BCC", "HCP", "amorphous"][i % 4] });
    }
    return csv(rows);
  }

  function heatTreatment() {
    const rows = [];
    for (let i = 1; i <= 85; i++) {
      const carbon = +(0.02 + (i % 28) * 0.018).toFixed(3);
      const chromium = +(0.2 + (i * 3 % 40) * 0.45).toFixed(2);
      const nickel = +(0.1 + (i * 5 % 35) * 0.33).toFixed(2);
      const aust = 760 + (i * 11) % 250;
      const quench = ["water", "oil", "air"][i % 3];
      const temper = 160 + (i * 17) % 520;
      const hardness = 22 + carbon * 75 + chromium * 0.7 - (temper - 160) * 0.025 + (quench === "water" ? 8 : quench === "oil" ? 3 : -2);
      rows.push({ heat_treatment_pass: hardness >= 38 && hardness <= 58 && aust >= 800 && aust <= 980 ? "pass" : "fail", C_wt_pct: carbon, Cr_wt_pct: chromium, Ni_wt_pct: nickel, austenitize_temp_c: aust, quench_medium: quench, temper_temp_c: temper, predicted_hardness_hrc: +hardness.toFixed(1) });
    }
    return csv(rows);
  }

  function alloyClustering() {
    const rows = [];
    for (let i = 1; i <= 96; i++) {
      const group = i % 4;
      if (group === 0) rows.push({ density_g_cm3: +(2.7 + (i % 8) * 0.03).toFixed(3), modulus_gpa: 70 + i % 20, thermal_expansion_10e6_k: 22 + i % 5, thermal_conductivity_w_mk: 130 + i % 55, cost_usd_kg: 4 + i % 6, corrosion_score: 7 + i % 3, processing: "wrought" });
      if (group === 1) rows.push({ density_g_cm3: +(7.8 + (i % 6) * 0.05).toFixed(3), modulus_gpa: 190 + i % 35, thermal_expansion_10e6_k: 11 + i % 4, thermal_conductivity_w_mk: 30 + i % 25, cost_usd_kg: 2 + i % 5, corrosion_score: 5 + i % 4, processing: "forged" });
      if (group === 2) rows.push({ density_g_cm3: +(4.5 + (i % 6) * 0.04).toFixed(3), modulus_gpa: 105 + i % 25, thermal_expansion_10e6_k: 8 + i % 4, thermal_conductivity_w_mk: 8 + i % 12, cost_usd_kg: 22 + i % 12, corrosion_score: 8 + i % 2, processing: "additive" });
      if (group === 3) rows.push({ density_g_cm3: +(8.4 + (i % 7) * 0.06).toFixed(3), modulus_gpa: 205 + i % 30, thermal_expansion_10e6_k: 14 + i % 3, thermal_conductivity_w_mk: 18 + i % 16, cost_usd_kg: 35 + i % 18, corrosion_score: 9, processing: "cast" });
    }
    return csv(rows);
  }

  function batteryMulti() {
    const rows = [];
    const chemistries = ["NMC", "LFP", "LMO", "NCA", "solid_state"];
    for (let i = 1; i <= 87; i++) {
      const chem = chemistries[i % chemistries.length];
      const ni = chem === "NMC" || chem === "NCA" ? 0.1 + (i % 8) * 0.08 : 0;
      const mn = chem === "NMC" || chem === "LMO" ? 0.2 + (i % 7) * 0.05 : 0;
      const co = chem === "NMC" || chem === "NCA" ? 0.05 + (i % 5) * 0.04 : 0;
      const particle = +(2 + (i * 3 % 40) * 0.4).toFixed(2);
      const coating = ["none", "carbon", "oxide", "polymer"][i % 4];
      rows.push({ capacity_mah_g: +(115 + ni * 105 + co * 40 - particle * 0.9 + (coating === "carbon" ? 12 : 0) + (i % 6) * 1.5).toFixed(2), cycle_retention_pct: +(78 + (coating === "carbon" || coating === "oxide" ? 10 : 0) - ni * 8 - particle * 0.18 + (i % 5) * 1.1).toFixed(2), chemistry: chem, Ni_fraction: +ni.toFixed(3), Mn_fraction: +mn.toFixed(3), Co_fraction: +co.toFixed(3), particle_size_um: i % 13 === 0 ? "" : particle, coating_type: i % 11 === 0 ? "" : coating, sinter_temp_c: i % 17 === 0 ? "" : 520 + (i * 19) % 420, electrolyte: ["carbonate", "gel", "solid", "ionic_liquid"][i % 4] });
    }
    return csv(rows);
  }

  window.TabularLabDefaultData = {
    alloy_strength: alloyStrength(),
    material_class: materialClass(),
    heat_treatment: heatTreatment(),
    alloy_clustering: alloyClustering(),
    battery_multi: batteryMulti()
  };
})();
