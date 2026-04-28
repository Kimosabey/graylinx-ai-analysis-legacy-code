function pivotTelemetryRows(rows) {
  const bucket = {};

  for (const r of rows) {
    const dt = new Date(r.measured_time);

    const date = dt.toISOString().slice(0, 10); // YYYY-MM-DD
    const time = dt.toTimeString().slice(0, 5); // HH:mm

    const key = `${date}_${time}`;

    if (!bucket[key]) {
      bucket[key] = { date, time };
    }

    bucket[key][r.param_id] =
      r.param_value !== null ? Number(r.param_value) : null;
  }

  return Object.values(bucket);
}

function pivotTelemetryRowsforplant(rows) {
  const map = {};

  rows.forEach(r => {
    // Split datetime
    const [date, timeFull] = r.measured_time.split(" ");
    const time = timeFull.slice(0, 5); // HH:mm

    const key = `${date} ${time}`;

    if (!map[key]) {
      map[key] = { date, time };
    }

    // Convert value to number
    const value = Number(r.ch1_param_value);

    map[key][r.param_id.trim()] = isNaN(value) ? null : value;
  });

  return Object.values(map);
}

module.exports = pivotTelemetryRows, pivotTelemetryRowsforplant;
