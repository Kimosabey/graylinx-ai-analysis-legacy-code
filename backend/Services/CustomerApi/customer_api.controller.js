const axios = require("axios");
const { SS_TYPE_TO_CATEGORY, BACNET_TO_CLEAN } = require("./equipment_mapping");

const UPSTREAM_URL = process.env.SNAPSHOT_URL;

// Sets a value at a dot-notation path on an object (e.g. 'alarms.trip_status')
function setNestedValue(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// Convert numeric strings to numbers, leave other strings as-is
function parseValue(raw) {
  const n = Number(raw);
  return isNaN(n) ? raw : n;
}

function buildCleanReading(eqpAttributes, ssType) {
  const attrMap = BACNET_TO_CLEAN[ssType];
  if (!attrMap) return null;

  const reading = {};
  let latestTime = null;

  for (const [bacnetAttr, cleanPath] of Object.entries(attrMap)) {
    const attrData = eqpAttributes[bacnetAttr];
    if (!attrData || attrData.presentValue == null) continue;

    setNestedValue(reading, cleanPath, parseValue(attrData.presentValue));

    if (attrData.measured_time) {
      const t = new Date(attrData.measured_time);
      if (!latestTime || t > latestTime) latestTime = t;
    }
  }

  if (Object.keys(reading).length === 0) return null;

  // Compute derived delta fields for chillers
  if (ssType === "NONGL_SS_CHILLER") {
    if (
      reading.evaporator_outlet_temp != null &&
      reading.evaporator_inlet_temp != null
    ) {
      reading.evaporator_delta_t = parseFloat(
        (
          reading.evaporator_outlet_temp - reading.evaporator_inlet_temp
        ).toFixed(2),
      );
    }
    if (
      reading.condenser_outlet_temp != null &&
      reading.condenser_inlet_temp != null
    ) {
      reading.condenser_delta_t = parseFloat(
        (reading.condenser_outlet_temp - reading.condenser_inlet_temp).toFixed(
          2,
        ),
      );
    }
  }

  reading.timestamp = latestTime
    ? latestTime
        .toISOString()
        .replace("T", " ")
        .slice(0, 19)
    : new Date()
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);

  return reading;
}

async function getEquipmentData(req, res) {
  try {
    const upstreamUrl = req.query.upstream_url || UPSTREAM_URL;
    if (!upstreamUrl) {
      return res.status(400).json({
        error:
          "Upstream URL not configured. Set SNAPSHOT_URL env variable or pass upstream_url query param.",
      });
    }

    const upstreamRes = await axios.get(upstreamUrl, { timeout: 15000 });
    const snapshot = upstreamRes.data;

    const result = {};

    for (const [ssType, equipments] of Object.entries(snapshot)) {
      const category = SS_TYPE_TO_CATEGORY[ssType];
      if (!category) continue;

      if (!result[category]) result[category] = {};

      for (const eqpData of Object.values(equipments)) {
        const name = eqpData.name;
        const attrs = eqpData.Eqp_Attributes;
        if (!name || !attrs) continue;

        const reading = buildCleanReading(attrs, ssType);
        if (!reading) continue;

        result[category][name] = [reading];
      }
    }

    return res.json(result);
  } catch (error) {
    if (error.response) {
      return res
        .status(502)
        .json({ error: "Upstream API error", details: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { getEquipmentData };
