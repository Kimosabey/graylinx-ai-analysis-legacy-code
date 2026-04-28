/* =======================
   SUMMARY DATA (FALLBACK) - EMPTY
   ======================= */
export const SUMMARY_DATA = [];

export const SUMMARY_BOTTOM_ROWS = [];

/* =======================
   ✅ SUMMARY API → TABLE FORMAT (FIXED)
   ======================= */
// export const formatSummaryApiData = (apiData) => {

//     if (!apiData || !apiData.success || !apiData.data) {

//         console.error("[formatSummaryApiData] Invalid API response");

//         return { sections: SUMMARY_DATA, bottomRows: SUMMARY_BOTTOM_ROWS };

//     }

//     const data = apiData.data;

//     const sections = [];

//     const fmt = (val) => {

//         if (val === null || val === undefined || val === "") return "";

//         if (typeof val === "string") return val;

//         if (typeof val === "number") return Number.isInteger(val) ? val : Number(val).toFixed(3);

//         return val;

//     };

//     // 1. CHILLERS

//     if (data.CHILLER) {

//         const ch = data.CHILLER;

//         const chillerRows = [];

//         if (ch.CH1) chillerRows.push({

//             description: "CHILLER-1 (kWh)",

//             runHours:     fmt(ch.CH1.Run_Hours),

//             committedKwh: fmt(ch.CH1.Committed_kWh ?? ""),

//             actualKwh:    fmt(ch.CH1.Actual_kWh),

//             difference:   fmt(ch.CH1.Difference ?? ""),

//         });

//         if (ch.CH2) chillerRows.push({

//             description: "CHILLER-2 (kWh)",

//             runHours:     fmt(ch.CH2.Run_Hours),

//             committedKwh: fmt(ch.CH2.Committed_kWh ?? ""),

//             actualKwh:    fmt(ch.CH2.Actual_kWh),

//             difference:   fmt(ch.CH2.Difference ?? ""),

//         });

//         if (ch.CH3) chillerRows.push({

//             description: "CHILLER-3 (kWh)",

//             runHours:     fmt(ch.CH3.Run_Hours),

//             committedKwh: fmt(ch.CH3.Committed_kWh ?? ""),

//             actualKwh:    fmt(ch.CH3.Actual_kWh),

//             difference:   fmt(ch.CH3.Difference ?? ""),

//         });

//         const total = ch.TOTAL || {};

//         sections.push({

//             title: "CHILLERS",

//             rows: chillerRows,

//             totalRow: {

//                 description: "TOTAL CHILLER (kWh)",

//                 runHours:     fmt(total.Run_Hours),

//                 committedKwh: fmt(total.Committed_kWh ?? ""),

//                 actualKwh:    fmt(total.Actual_kWh),

//                 difference:   fmt(total.Difference ?? ""),

//             },

//         });

//     }

//     // 2. PRIMARY PUMPS

//     if (data.PRIMARY_PUMP) {

//         const pp = data.PRIMARY_PUMP;

//         const pumpRows = [];

//         if (pp.PV1) pumpRows.push({

//             description: "PRIMARY PUMPS-1 (kWh)",

//             runHours:     fmt(pp.PV1.Run_Hours),

//             committedKwh: "",

//             actualKwh:    fmt(pp.PV1.Actual_kWh),

//             difference:   "",

//         });

//         if (pp.PV2) pumpRows.push({

//             description: "PRIMARY PUMPS-2 (kWh)",

//             runHours:     fmt(pp.PV2.Run_Hours),

//             committedKwh: "",

//             actualKwh:    fmt(pp.PV2.Actual_kWh),

//             difference:   "",

//         });

//         if (pp.PV3) pumpRows.push({

//             description: "PRIMARY PUMPS-3 (kWh)",

//             runHours:     fmt(pp.PV3.Run_Hours),

//             committedKwh: "",

//             actualKwh:    fmt(pp.PV3.Actual_kWh),

//             difference:   "",

//         });

//         const total = pp.TOTAL || {};

//         sections.push({

//             title: "PUMPS",

//             rows: pumpRows,

//             totalRow: {

//                 description: "TOTAL PRIMARY PUMPS (kWh)",

//                 runHours:     fmt(total.Run_Hours),

//                 committedKwh: fmt(total.Committed_kWh ?? ""),

//                 actualKwh:    fmt(total.Actual_kWh),

//                 difference:   fmt(total.Difference ?? ""),

//             },

//         });

//     }

//     // 3. COOLING TOWER FANS

//     if (data.CT_FAN) {

//         const ct = data.CT_FAN;

//         const ctRows = [];

//         const ctMap = [

//             { key: "CT1_F1", label: "COOLING TOWER-1 FAN-1 (kWh)" },

//             { key: "CT1_F2", label: "COOLING TOWER-1 FAN-2 (kWh)" },

//             { key: "CT2_F1", label: "COOLING TOWER-2 FAN-1 (kWh)" },

//             { key: "CT2_F2", label: "COOLING TOWER-2 FAN-2 (kWh)" },

//             { key: "CT3_F1", label: "COOLING TOWER-3 FAN-1 (kWh)" },

//             { key: "CT3_F2", label: "COOLING TOWER-3 FAN-2 (kWh)" },

//         ];

//         for (const { key, label } of ctMap) {

//             if (ct[key]) ctRows.push({

//                 description: label,

//                 runHours:     fmt(ct[key].Run_Hours),

//                 committedKwh: "",

//                 actualKwh:    fmt(ct[key].Actual_kWh),

//                 difference:   "",

//             });

//         }

//         const total = ct.TOTAL || {};

//         sections.push({

//             title: "COOLING TOWER",

//             rows: ctRows,

//             totalRow: {

//                 description: "TOTAL COOLING TOWER (kWh)",

//                 runHours:     fmt(total.Run_Hours),

//                 committedKwh: fmt(total.Committed_kWh ?? ""),

//                 actualKwh:    fmt(total.Actual_kWh),

//                 difference:   fmt(total.Difference ?? ""),

//             },

//         });

//     }

//     // 4. CONDENSER PUMPS

//     if (data.CONDENSER_PUMP) {

//         const cp = data.CONDENSER_PUMP;

//         const cpRows = [];

//         if (cp.CP01) cpRows.push({

//             description: "CONDENSER PUMP-1 (kWh)",

//             runHours:     fmt(cp.CP01.Run_Hours),

//             committedKwh: "",

//             actualKwh:    fmt(cp.CP01.Actual_kWh),

//             difference:   "",

//         });

//         if (cp.CP02) cpRows.push({

//             description: "CONDENSER PUMP-2 (kWh)",

//             runHours:     fmt(cp.CP02.Run_Hours),

//             committedKwh: "",

//             actualKwh:    fmt(cp.CP02.Actual_kWh),

//             difference:   "",

//         });

//         if (cp.CP03) cpRows.push({

//             description: "CONDENSER PUMP-3 (kWh)",

//             runHours:     fmt(cp.CP03.Run_Hours),

//             committedKwh: "",

//             actualKwh:    fmt(cp.CP03.Actual_kWh),

//             difference:   "",

//         });

//         const total = cp.TOTAL || {};

//         sections.push({

//             title: "CONDENSER PUMP",

//             rows: cpRows,

//             totalRow: {

//                 description: "TOTAL CONDENSER PUMP (kWh)",

//                 runHours:     fmt(total.Run_Hours),

//                 committedKwh: fmt(total.Committed_kWh ?? ""),

//                 actualKwh:    fmt(total.Actual_kWh),

//                 difference:   fmt(total.Difference ?? ""),

//             },

//         });

//     }

//     // Bottom rows

//     const bottomRows = [];

//     if (data.TOTAL_CHILLER_PLANT) {

//         bottomRows.push({

//             description: "TOTAL CHILLER PLANT",

//             committedKwh: fmt(data.TOTAL_CHILLER_PLANT.Committed_kWh ?? ""),

//             actualKwh:    fmt(data.TOTAL_CHILLER_PLANT.Actual_kWh),

//             difference:   fmt(data.TOTAL_CHILLER_PLANT.Difference ?? ""),

//         });

//     }

//     if (data.TOTAL_TRH) {

//         bottomRows.push({

//             description: "TOTAL TRH",

//             committedKwh: "",

//             actualKwh:    fmt(data.TOTAL_TRH.Actual_TRH),

//             difference:   "",

//         });

//     }

//     if (data.CHILLER_SPC) {

//         bottomRows.push({

//             description: "CHILLER SPC",

//             committedKwh: fmt(data.CHILLER_SPC.Committed ?? ""),

//             actualKwh:    fmt(data.CHILLER_SPC.Actual),

//             difference:   fmt(data.CHILLER_SPC.Difference ?? ""),

//         });

//     }

//     if (data.PLANT_SPC) {

//         bottomRows.push({

//             description: "PLANT SPC",

//             committedKwh: fmt(data.PLANT_SPC.Committed ?? ""),

//             actualKwh:    fmt(data.PLANT_SPC.Actual),

//             difference:   fmt(data.PLANT_SPC.Difference ?? ""),

//         });

//     }

//     console.log("[formatSummaryApiData] ✅ Formatted data:", { sections, bottomRows });

//     return { sections, bottomRows };

// };
export const formatSummaryApiData = (apiData) => {

    if (!apiData || !apiData.success || !apiData.data) {
        console.error("[formatSummaryApiData] Invalid API response");
        return { sections: SUMMARY_DATA, bottomRows: SUMMARY_BOTTOM_ROWS };
    }

    const data = apiData.data;
    const sections = [];

//  const fmt = (val) => {
//     if (val === null || val === undefined || val === "") return "-";

//     if (typeof val === "number") {
//         return val.toFixed(2); // ✅ KEEP AS STRING
//     }

//     return val;
// };

const fmt = (val) => val;


    // 1. CHILLERS ✅ Fixed: data.CHILLER (not CHILLERS)
    if (data.CHILLER) {
        const ch = data.CHILLER; // ✅ was data.CHILLERS
        const chillerRows = [];

        if (ch.chiller_1) chillerRows.push({
            description: "CHILLER-1 (kWh)",
            runHours: fmt(ch.chiller_1.Run_Hours),
            committedKwh: fmt(ch.chiller_1.Committed_kWh ?? ""),
            actualKwh: fmt(ch.chiller_1.Actual_kWh),
            difference: fmt(ch.chiller_1.Difference ?? ""),
        });

        if (ch.chiller_2) chillerRows.push({
            description: "CHILLER-2 (kWh)",
            runHours: fmt(ch.chiller_2.Run_Hours),
            committedKwh: fmt(ch.chiller_2.Committed_kWh ?? ""),
            actualKwh: fmt(ch.chiller_2.Actual_kWh),
            difference: fmt(ch.chiller_2.Difference ?? ""),
        });
        

        // if (ch.CH3) chillerRows.push({
        //     description: "CHILLER-3 (kWh)",
        //     runHours:     fmt(ch.CH3.Run_Hours),
        //     committedKwh: fmt(ch.CH3.Committed_kWh ?? ""),
        //     actualKwh:    fmt(ch.CH3.Actual_kWh),
        //     difference:   fmt(ch.CH3.Difference ?? ""),
        // });

        const total = ch.TOTAL || {};
        sections.push({
            title: "CHILLERS",
            rows: chillerRows,
            totalRow: {
                description: "TOTAL CHILLER (kWh)",
                runHours: fmt(total.Run_Hours),
                committedKwh: fmt(total.Committed_kWh ?? ""),
                actualKwh: fmt(total.Actual_kWh),
                difference: fmt(total.Difference ?? ""),
            },
        });
    }

    // 2. PRIMARY CONDENSER PUMP ✅ Fixed: data.PRIMARY_CONDENSOR_PUMP (not PRIMARY_PUMP)
    if (data.PRIMARY_PUMP) {
        const pp = data.PRIMARY_PUMP; // ✅ was data.PRIMARY_PUMP
        const pumpRows = [];

        if (pp.PVCP) pumpRows.push({  // ✅ was pp.PV1
            description: "PRIMARY Pump (kWh)",
            runHours: fmt(pp.PVCP.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(pp.PVCP.Actual_kWh),
            difference: "",
        });

        // Keep PV1/PV2/PV3 as fallback if API ever returns them
        if (pp.primary_pump_1) pumpRows.push({
            description: "PRIMARY PUMPS-1 (kWh)",
            runHours: fmt(pp.primary_pump_1.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(pp.primary_pump_1.Actual_kWh),
            difference: "",
        });

        if (pp.primary_pump_2) pumpRows.push({
            description: "PRIMARY PUMPS-2 (kWh)",
            runHours: fmt(pp.primary_pump_2.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(pp.primary_pump_2.Actual_kWh),
            difference: "",
        });

        if (pp.primary_pump_3) pumpRows.push({
            description: "PRIMARY PUMPS-3 (kWh)",
            runHours: fmt(pp.primary_pump_3.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(pp.primary_pump_3.Actual_kWh),
            difference: "",
        });

        const total = pp.TOTAL || {};
        sections.push({
            title: "PRIMARY PUMPS",
            rows: pumpRows,
            totalRow: {
                description: "TOTAL PRIMARY PUMPS (kWh)",
                runHours: fmt(total.Run_Hours),
                committedKwh: fmt(total.Committed_kWh ?? ""),
                actualKwh: fmt(total.Actual_kWh),
                difference: fmt(total.Difference ?? ""),
            },
        });
    }
    {
        console.log(data, "datadata");
    }
    // 3. SECONDARY PUMPS ✅ New section added
    if (data.SECONDARY_PUMP) {
        const sp = data.SECONDARY_PUMP;
        const spRows = [];

        if (sp.secondary_pump_1) spRows.push({
            description: "SECONDARY PUMP-1 (kWh)",
            runHours: fmt(sp.secondary_pump_1.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(sp.secondary_pump_1.Actual_kWh),
            difference: "",
        });

        if (sp.secondary_pump_2) spRows.push({
            description: "SECONDARY PUMP-2 (kWh)",
            runHours: fmt(sp.secondary_pump_2.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(sp.secondary_pump_2.Actual_kWh),
            difference: "",
        });


        if (sp.secondary_pump_3) spRows.push({
            description: "SECONDARY PUMP-3 (kWh)",
            runHours: fmt(sp.secondary_pump_3.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(sp.secondary_pump_3.Actual_kWh),
            difference: "",
        });
        if (sp.secondary_pump_4) spRows.push({
            description: "SECONDARY PUMP-4 (kWh)",
            runHours: fmt(sp.secondary_pump_4.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(sp.secondary_pump_4.Actual_kWh),
            difference: "",
        });
        if (sp.secondary_pump_5) spRows.push({
            description: "SECONDARY PUMP-5 (kWh)",
            runHours: fmt(sp.secondary_pump_5.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(sp.secondary_pump_5.Actual_kWh),
            difference: "",
        });
        if (sp.secondary_pump_6) spRows.push({
            description: "SECONDARY PUMP-6 (kWh)",
            runHours: fmt(sp.secondary_pump_6.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(sp.secondary_pump_6.Actual_kWh),
            difference: "",
        });
        const total = sp.TOTAL || {};
        sections.push({
            title: "SECONDARY PUMPS",
            rows: spRows,
            totalRow: {
                description: "TOTAL SECONDARY PUMPS (kWh)",
                runHours: fmt(total.Run_Hours),
                committedKwh: "",
                actualKwh: fmt(total.Actual_kWh),
                difference: "",
            },
        });
    }

    // 4. COOLING TOWER FANS ✅ No changes needed
    if (data.COOLING_TOWER) {
    const ct = data.COOLING_TOWER;
    const ctRows = [];

    if (ct.cooling_tower_1) ctRows.push({
        description: "COOLING TOWER-1 (kWh)",
        runHours: fmt(ct.cooling_tower_1.Run_Hours),
        committedKwh: "", // not available in payload
        actualKwh: fmt(ct.cooling_tower_1.Actual_kWh),
        difference: "",
    });

    if (ct.cooling_tower_2) ctRows.push({
        description: "COOLING TOWER-2 (kWh)",
        runHours: fmt(ct.cooling_tower_2.Run_Hours),
        committedKwh: "",
        actualKwh: fmt(ct.cooling_tower_2.Actual_kWh),
        difference: "",
    });

    if (ct.cooling_tower_3) ctRows.push({
        description: "COOLING TOWER-3 (kWh)",
        runHours: fmt(ct.cooling_tower_3.Run_Hours),
        committedKwh: "",
        actualKwh: fmt(ct.cooling_tower_3.Actual_kWh),
        difference: "",
    });

    const total = ct.TOTAL || {};

    sections.push({
        title: "COOLING TOWER",
        rows: ctRows,
        totalRow: {
            description: "TOTAL COOLING TOWER (kWh)",
            runHours: fmt(total.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(total.Actual_kWh),
            difference: "",
        },
    });
}

    // 5. CONDENSER PUMP (kept for backward compatibility)
    if (data.CONDENSER_PUMP) {
        const cp = data.CONDENSER_PUMP;
        const cpRows = [];

        if (cp.condenser_pump_1) cpRows.push({
            description: "CONDENSER PUMP-1 (kWh)",
            runHours: fmt(cp.condenser_pump_1.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(cp.condenser_pump_1.Actual_kWh),
            difference: "",
        });

        if (cp.condenser_pump_2) cpRows.push({
            description: "CONDENSER PUMP-2 (kWh)",
            runHours: fmt(cp.condenser_pump_2.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(cp.condenser_pump_2.Actual_kWh),
            difference: "",
        });

        if (cp.condenser_pump_3) cpRows.push({
            description: "CONDENSER PUMP-3 (kWh)",
            runHours: fmt(cp.condenser_pump_3.Run_Hours),
            committedKwh: "",
            actualKwh: fmt(cp.condenser_pump_3.Actual_kWh),
            difference: "",
        });

        const total = cp.TOTAL || {};
        sections.push({
            title: "CONDENSER PUMP",
            rows: cpRows,
            totalRow: {
                description: "TOTAL CONDENSER PUMP (kWh)",
                runHours: fmt(total.Run_Hours),
                committedKwh: fmt(total.Committed_kWh ?? ""),
                actualKwh: fmt(total.Actual_kWh),
                difference: fmt(total.Difference ?? ""),
            },
        });
    }

    // Bottom rows
    const bottomRows = [];

    if (data.TOTAL_CHILLER_PLANT) {
        bottomRows.push({
            description: "TOTAL CHILLER PLANT",
            committedKwh: fmt(data.TOTAL_CHILLER_PLANT.Committed_kWh ?? ""),
            actualKwh: fmt(data.TOTAL_CHILLER_PLANT.Actual_kWh),
            difference: fmt(data.TOTAL_CHILLER_PLANT.Difference ?? ""),
        });
    }

    if (data.TOTAL_TRH) {
        bottomRows.push({
            description: "TOTAL TRh",
            committedKwh: "",
            actualKwh: fmt(data.TOTAL_TRH.Actual_TRH),
            difference: "",
        });
    }

    if (data.CHILLER_SPC) {
        bottomRows.push({
            description: "CHILLER SPC",
            committedKwh: fmt(data.CHILLER_SPC.Committed ?? ""),
            actualKwh: fmt(data.CHILLER_SPC.Actual),
            difference: fmt(data.CHILLER_SPC.Difference ?? ""),
        });
    }

    if (data.PLANT_SPC) {
        bottomRows.push({
            description: "PLANT SPC",
            committedKwh: fmt(data.PLANT_SPC.Committed ?? ""),
            actualKwh: fmt(data.PLANT_SPC.Actual),
            difference: fmt(data.PLANT_SPC.Difference ?? ""),
        });
    }

    


    console.log("[formatSummaryApiData] ✅ Formatted data:", { sections, bottomRows });
    return { sections, bottomRows };
};

/* =======================
   BTU METER DATA (FALLBACK)
   ======================= */
export const ENERGY_METER_DATA = {
    columns: ["DATE", "TIME", "ACTUAL FLOW (m³/h)", "INLET TEMP (°C)", "OUTLET TEMP (°C)", "VOLUME (m³)"],
    rows: [
        ["10-NOV-2025", "00:00", "650.5", "8.04", "11.30", "5638890"],
        ["10-NOV-2025", "00:01", "651.2", "8.05", "11.31", "5638900"],
        ["10-NOV-2025", "00:02", "649.8", "8.03", "11.29", "5638910"],
    ],
};

/* =======================
   DROPDOWN
   ======================= */
export const CHILLERS_DROPDOWN_LIST = ["Chiller - 1", "Chiller - 2"];

/* =======================
   SAFE FORMAT HELPER
   ======================= */
const safeFormat = (value, decimals = 2) => {
    if (value === null || value === undefined || value === "" || isNaN(value)) {
        return "-";
    }
    return Number(value).toFixed(decimals);
};

/* =======================
   ✅ CHILLERS API → TABLE
   ======================= */
/* =======================
   ✅ CHILLERS API → TABLE
   ======================= */
export const formatChillerApiData = (apiData) => {
    if (!apiData) {
        console.error("[formatChillerApiData] API response missing");
        return { columns: [], rows: [] };
    }

    const tableData = Array.isArray(apiData.data)
        ? apiData.data
        : Array.isArray(apiData.data?.data)
            ? apiData.data.data
            : [];

    if (!tableData.length) {
        console.error("[formatChillerApiData] No data found");
        return { columns: [], rows: [] };
    }

    /* ⭐ Helper to convert 1/0 → ON/OFF */
    const formatOnOff = (val) => {
        if (val === 1) return "ON";
        if (val === 0) return "OFF";
        if (val === 2) return "WarmUp";
        return val;
    };

    const COLUMN_MAP = [
        { key: "DATE", label: "DATE" },
        { key: "TIME", label: "TIME" },

        // ✅ status column
        // { key: "cmd_on_off", label: "CHILLER STATUS", type: "status" },
        { key: "is_running", label: "CHILLER STATUS", type: "status" },
        // { key: "comp_on_off_02", label: "CHILLER2 STATUS", type: "status" },
        { key: "temp_setpoint", label: "CHILLER TEMPERATURE LEAVING SETPOINT(DEG C)" },
        { key: "evap_leaving_temp", label: "CHW OUTLET TEMPERATURE (DEG C)" },
        { key: "evap_entering_temp", label: "CHW INLET TEMPERATURE (DEG C)" },
        // { key: "Flow_Meter_Eva_1", label: "EVAPORATOR FLOW (m3/hr)" },
        // { key: "DELTA_T_DEG", label: "DELTA T (DEG C)" },
        { key: "chw_delta_t", label: "CHW DELTA T (DEG C)" },
        { key: "tr", label: "TR(Calculated)" },
        { key: "cumulative_trh", label: "TRh(Calculated)" },
        // { key: "ROUNDED_TR", label: "ROUNDED TR" },
        // { key: "kW_01", label: "CHILLER POWER CONSUMPTION" },
        // { key: "kW_02", label: "COMP-2 POWER CONSUMPTION (kW)" },
        { key: "kw", label: "TOTAL CHILLER POWER CONSUMPTION (kW)" },

        { key: "cumulative_kwh", label: "CH, kWh CONSUMPTION" },

        //{ key: "chiller_flow", label: "CHILLER FLOW (m³/h)" },
        { key: "cond_entering_temp", label: "CEFT TEMPERATURE (DEG C)" },
        { key: "cond_leaving_temp", label: "CLFT TEMPERATURE (DEG C)" },
        // { key: "Wet_Bulb_Temp", label: "WET BULB TEMPERATURE - CHILLER 1 (DEG C)" },
        // { key: "Chiller_Load_Percent", label: "CHILLER LOAD (TR%)" },
        { key: "chiller_load_percentage", label: "CHILLER LOAD" },
        // { key: "comp_load_02", label: "COMPRESSOR2 LOAD" },

        { key: "kw_per_tr", label: "ACTUAL OPERATING (ikW/TR)" },
        // { key: "Committed_kW_per_TR", label: "COMMITTED PERFORMANCE (ikW/TR)" },
        // { key: "Committed_kW", label: "COMMITED kW" },
        // { key: "Performance_Deviation_Percent", label: "PERFORMANCE DEVIATION (%)" },
        { key: "run_hours", label: "RUN HOURS" },
    ];

    const columns = COLUMN_MAP.map((c) => c.label);

    const rows = tableData.map((item) =>
        COLUMN_MAP.map(({ key, type }) => {
            let value = item[key];

            /* ⭐ Convert status values */
            if (type === "status") {
                return formatOnOff(value);
            }

            if (value === null || value === undefined || value === "") return "-";

//           if (typeof value === "number") {
//     return value.toFixed(2);
// }

            return value;
        })
    );

    return { columns, rows };
};


/* =======================
   ✅ CHILLER PLANT API → TABLE
   ======================= */
export const formatChillerPlantApiData = (apiData) => {

    if (!apiData) {
        console.error("[formatChillerPlantApiData] API response missing");
        return { columns: [], rows: [] };
    }

    const tableData = Array.isArray(apiData.data)
        ? apiData.data
        : Array.isArray(apiData.data?.data)
            ? apiData.data.data
            : [];

    if (!tableData.length) {
        console.error("[formatChillerPlantApiData] No data found");
        return { columns: [], rows: [] };
    }
     

    const COLUMN_MAP = [
        { key: "DATE", label: "DATE" },
        { key: "TIME", label: "TIME" },

        { key: "chiller_1_tr", label: "CHILLER 1 TR" },
        { key: "chiller_1_kw", label: "CHILLER 1 kW" },
        { key: "chiller_1_kw_per_tr", label: "SPC 1" },

        { key: "chiller_2_tr", label: "CHILLER 2 TR" },
        { key: "chiller_2_kw", label: "CHILLER 2 kW" },
        { key: "chiller_2_kw_per_tr", label: "SPC 2" },


        // { key: "CH3_TR", label: "CHILLER 3 TR" },
        // { key: "CH3_kW", label: "CHILLER 3 kW" },
        //{ key: "CH3_kW_per_TR", label: "SPC 3" },
        //{ key: "Total_Chiller_kW", label: "CHILLERS TOTAL- kW" },
        //{ key: "Total_Chiller_kWh", label: "CHILLERS TOTAL- kWh" },

        //{ key: "Total_PRIMARY_CONDENSOR_PUMP_kW", label: "TOTAL PRIMARY & CONDENSER PUMP kW" },
        // { key: "PV2_par_pump_avg_power_00", label: "NEW CHW PRIMARY PUMP # 2- kW" },
        // { key: "PV3_par_pump_avg_power_00", label: "NEW CHW PRIMARY PUMP # 3- kW" },

        { key: "primary_pump_1_kw", label: "PRIMARY PUMP # 1- kW" },
        { key: "primary_pump_1_cumulative_kwh", label: "PRIMARY PUMP # 1- kWh" },

        { key: "primary_pump_2_kw", label: "PRIMARY PUMP # 2- kW" },
        { key: "primary_pump_2_cumulative_kwh", label: "PRIMARY PUMP # 2- kWh" },

        { key: "primary_pump_3_kw", label: "PRIMARY PUMP # 3- kW" },
        { key: "primary_pump_3_cumulative_kwh", label: "PRIMARY PUMP # 3- kWh" },

        { key: "Total_Primary_Pump_kW", label: "PRIMARY PUMPS- TOTAL kW" },
        { key: "Total_Primary_Pump_cumulative_kWh", label: "PRIMARY PUMPS- TOTAL kWh" },

        { key: "condenser_pump_1_kw", label: "CONDENSER PUMP # 1- kW" },
        { key: "condenser_pump_1_cumulative_kwh", label: "CONDENSER PUMP # 1- kWh" },
        { key: "condenser_pump_2_kw", label: "CONDENSER PUMP # 2- kW" },
        { key: "condenser_pump_2_cumulative_kwh", label: "CONDENSER PUMP # 2- kWh" },
        { key: "condenser_pump_3_kw", label: "CONDENSER PUMP # 3- kW" },
        { key: "condenser_pump_3_cumulative_kwh", label: "CONDENSER PUMP # 3- kWh" },

        { key: "Total_Condenser_Pump_kW", label: "CONDENSER PUMPS- TOTAL kW" },
        { key: "Total_Condenser_Pump_cumulative_kWh", label: "CONDENSER PUMPS- TOTAL kWh" },




        

        { key: "secondary_pump_1_kw", label: "SECONDARY PUMP # 1- kW" },
        { key: "secondary_pump_1_cumulative_kwh", label: "SECONDARY PUMP # 1- kWh" },
        { key: "secondary_pump_2_kw", label: "SECONDARY PUMP # 2- kW" },
        { key: "secondary_pump_2_cumulative_kwh", label: "SECONDARY PUMP # 2- kWh" },
        { key: "secondary_pump_3_kw", label: "SECONDARY PUMP # 3- kW" },
        { key: "secondary_pump_3_cumulative_kwh", label: "SECONDARY PUMP # 3- kWh" },
        { key: "secondary_pump_4_kw", label: "SECONDARY PUMP # 4- kW" },
        { key: "secondary_pump_4_cumulative_kwh", label: "SECONDARY PUMP # 4- kWh" },
        { key: "secondary_pump_5_kw", label: "SECONDARY PUMP # 5- kW" },
        { key: "secondary_pump_5_cumulative_kwh", label: "SECONDARY PUMP # 5- kWh" },
        { key: "secondary_pump_6_kw", label: "SECONDARY PUMP # 6- kW" },
        { key: "secondary_pump_6_cumulative_kwh", label: "SECONDARY PUMP # 6- kWh" },

        { key: "Total_Secondary_Pump_kW", label: "SECONDARY PUMPS- TOTAL kW" },
        { key: "Total_Secondary_Pump_cumulative_kWh", label: "SECONDARY PUMPS- TOTAL kWh" },

        // { key: "CP01_Drive_Power", label: "NEW CONDENSER PUMP-01 kW" },
        // { key: "CP01_CUMULATIVE_kWh", label: "NEW CONDENSER PUMP-01 kWh" },

        // { key: "CP02_Drive_Power", label: "NEW CONDENSER PUMP-02 kW" },
        // { key: "CP02_CUMULATIVE_kWh", label: "NEW CONDENSER PUMP-02 kWh" },

        // { key: "CP03_Drive_Power", label: "NEW CONDENSER PUMP 3 kW" },
        // { key: "CP03_CUMULATIVE_kWh", label: "NEW CONDENSER PUMP 3 kWh" },

        // { key: "Total_Condenser_Pump_kW", label: "NEW CDW CONDENSER PUMPS- TOTAL kW" },
        // { key: "Total_CONDENSER_PUMP_kWh", label: "NEW CDW CONDENSER PUMPS- TOTAL kWh" },

        { key: "cooling_tower_1_kw", label: "COOLING TOWER-1 kW" },
        { key: "cooling_tower_1_cumulative_kwh", label: "COOLING TOWER-1 kWh" },

        { key: "cooling_tower_2_kw", label: "COOLING TOWER-2 kW" },
        { key: "cooling_tower_2_cumulative_kwh", label: "COOLING TOWER-2 kWh" },

        { key: "cooling_tower_3_kw", label: "COOLING TOWER-3 kW" },
        { key: "cooling_tower_3_cumulative_kwh", label: "COOLING TOWER-3 kWh" },

        // { key: "CT1_F2_Drive_Power", label: "NEW COOLING TOWER-1 FAN-2 kW" },
        // { key: "CT1_F2_Cumulative_kWh_calc", label: "NEW COOLING TOWER-1 FAN-2 kWh" },


        // { key: "CT2_F1_Drive_Power", label: "NEW COOLING TOWER-2 FAN-1 kW" },
        // { key: "CT2_F1_Cumulative_kWh_calc", label: "NEW COOLING TOWER-2 FAN-1 kWh" },

        // { key: "CT2_F2_Drive_Power", label: "NEW COOLING TOWER-2 FAN-2 kW" },
        // { key: "CT2_F2_Cumulative_kWh_calc", label: "NEW COOLING TOWER-2 FAN-2 kWh" },

        // { key: "CT3_F1_Drive_Power", label: "NEW COOLING TOWER-3 FAN-1 kW" },
        // { key: "CT3_F1_Cumulative_kWh_calc", label: "NEW COOLING TOWER-3 FAN-1 kWh" },

        // { key: "CT3_F2_Drive_Power", label: "NEW COOLING TOWER-3 FAN-2 kW" },
        // { key: "CT3_F2_Cumulative_kWh_calc", label: "NEW COOLING TOWER-3 FAN-2 kWh" },

        { key: "Total_Cooling_Tower_kW", label: "COOLING TOWERS- TOTAL kW" },
        { key: "Total_Cooling_Tower_cumulative_kWh", label: "COOLING TOWERS- TOTAL kWh" },

        
        //{ key: "Total_Aux_kW", label: "TOTAL AUX. KW (PRIMARY, CONDENSER, COOLING TOWER)" },

        { key: "Total_Plant_kW", label: "TOTAL PLANT ROOM (kW)" },
        { key: "Total_Plant_TR", label: "TOTAL TR" },
        //{ key: "Chiller_SPC", label: "OVERALL CHILLER SPC" },
        { key: "kW_per_TR", label: "TOTAL PLANT ROOM SPC" },
        
        { key: "wet_bulb_temp", label: "AMBIENT WET BULB TEMPERATURE (DEG C)" },
        // { key: "chillers_in_operation", label: "CT 1 INLET TEMPERATURE (DEG C)" },
        // { key: "chiller_loading", label: "CHILLER LOADING (%)" },
        // { key: "CHW_PUMP_KW", label: "COMMITTED CHW PUMP POWER (kW)" },
        // { key: "CDW_PUMP_KW", label: "COMMITTED CDW PUMP POWER (kW)" },
        // { key: "CT_FAN_KW", label: "COMMITTED CT FAN POWER (kW)" },
        // { key: "CH2_CH_Leaving_Chilled_Lqd_Temp", label: "CH2 CHW OUTLET TEMP (°C)" },
        // { key: "CH2_Act_Pwr_Total", label: "YK CHILLER 2 KW" },
        // { key: "CHILLER2_ROUNDED_TR", label: "YK CHILLER 2 TR" },

    ];
    console.log("COLUMN_MAP:", COLUMN_MAP);

    const columns = COLUMN_MAP.map((c) => c.label);

    const rows = tableData.map((item) =>
        COLUMN_MAP.map(({ key }) => {
            const value = item[key];
            if (value === null || value === undefined || value === "") return "-";
//             if (typeof value === "number") {
//     return value.toFixed(2);
// }
            return value;
        })
    );

    return { columns, rows };
};

/* =======================
   ✅ BTU METER API → TABLE
   ======================= */
export const formatBtuMeterApiData = (apiData) => {
    if (!apiData) {
        console.error("[formatBtuMeterApiData] API response missing");
        return { columns: [], rows: [] };
    }

    const tableData = Array.isArray(apiData.data)
        ? apiData.data
        : Array.isArray(apiData.data?.data)
            ? apiData.data.data
            : [];

    if (!tableData.length) {
        console.error("[formatBtuMeterApiData] No data found");
        return { columns: [], rows: [] };
    }

    const COLUMN_MAP = [
        { key: "DATE", label: "DATE" },
        { key: "TIME", label: "TIME" },
        { key: "actual_flow", label: "ACTUAL FLOW (m³/h)" },
        { key: "inlet_temp", label: "INLET TEMP (°C)" },
        { key: "outlet_temp", label: "OUTLET TEMP (°C)" },
        //{ key: "btu_meter_volume_flow_00", label: "VOLUME (m³)" },
        { key: "actual_power", label: "ACTUAL POWER (TR)" },
        // { key: "btu_meter_energy_flow_00", label: "ENERGY CONSUMPTION (TR)" },
        { key: "energy_consump", label: "ENERGY CONSUMPTION (TRh)" },
    ];

    const columns = COLUMN_MAP.map((c) => c.label);

    const rows = tableData.map((item) =>
        COLUMN_MAP.map(({ key }) => {
            const value = item[key];
            if (value === null || value === undefined || value === "") return "-";
//             if (typeof value === "number") {
//     return value.toFixed(2);
// }
            return value;
        })
    );

    return { columns, rows };
};

/* =======================
   CHILLER PLANT DATA (FALLBACK)
   ======================= */
export const CHILLER_PLANT_DATA = {
    columns: [
        "DATE",
        "TIME",
        "PLANT STATUS",
        "TOTAL LOAD (TR)",
        "PLANT COP",
        "POWER INPUT (KW)",
        "COOLING OUTPUT (KW)",
        "EFFICIENCY (%)",
    ],
    rows: [
        ["10-NOV-2025", "00:00", "ON", "320.5", "3.82", "183.2", "700.1", "82.4"],
    ],
};