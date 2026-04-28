const schedule = require("node-schedule");
const { write_cond_set_point_by_wbt } = require("./header_points_control");
const actions = require("../actions");

const {
  runNightlySetpointOptimizer,
  set_chiller_setpoint,
} = require("../automated_setpoint_optimizer");

const wbt_add_value = 2;

schedule.scheduleJob("0 */15 * * * *", async () => {
  try {
    const manual_state = await actions.read_cpm_mode_status("manual_mode");
    if (manual_state === "active") {
      console.log("manual mode is active skipping auto cond setpoint");
      return true;
    }
    const res = await write_cond_set_point_by_wbt(wbt_add_value);
    console.log("Job ran successfully at:", new Date().toLocaleString(), res);
  } catch (err) {
    console.error("Job failed at:", new Date().toLocaleString(), err);
  }
});

// set point 8 to 11
schedule.scheduleJob("0 */15 * * * *", async () => {
  try {
    const manual_state = await actions.read_cpm_mode_status("manual_mode");
    if (manual_state === "active") {
      console.log("manual mode is active skipping auto evap setpoint");
      return true;
    }
    const api_endpoint_kw = "https://localhost/v1/newapis/plantapi";
    const fetchRes = await fetch(api_endpoint_kw);
    const data = await fetchRes.json();
    const plant_kw = data[0].total_kw;
    const res = await runNightlySetpointOptimizer(plant_kw);
    console.log("Job ran successfully at:", new Date().toLocaleString(), res);
  } catch (err) {
    console.error("Job failed at:", new Date().toLocaleString(), err);
  }
});

// // static 9 point write to the active chiller
// schedule.scheduleJob("0 */15 * * * *", async () => {
//   try {
//     const res = await set_chiller_setpoint(9);
//     console.log("Job ran successfully at:", new Date().toLocaleString(), res);
//   } catch (err) {
//     console.error("Job failed at:", new Date().toLocaleString(), err);
//   }
// });
