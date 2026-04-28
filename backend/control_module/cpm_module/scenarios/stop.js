const procedures = require("../procedures");

async function stop_aircooled_primary_variable_system() {
  console.log("Stopping aircooled primary variable system...");
  return await procedures.stop_aircooled_primary_variable();
}

async function stop_aircooled_primary_secondary_system() {
  console.log("Stopping aircooled primary secondary system...");
  return await procedures.stop_aircooled_primary_secondary();
}

async function stop_watercooled_primary_variable_system() {
  console.log("Stopping watercooled primary variable system...");
  return await procedures.stop_watercooled_primary_variable();
}

async function stop_watercooled_primary_variable_type2_system() {
  console.log("Stopping watercooled primary variable type 2 system...");
  return await procedures.stop_watercooled_primary_variable_type2();
}

async function stop_watercooled_primary_secondary_system() {
  console.log("Stopping watercooled primary secondary system...");
  return await procedures.stop_watercooled_primary_secondary();
}

async function stop_aircooled_primary_variable_1c1pv_system() {
  console.log("Stopping aircooled primary variable 1C:1PV system...");
  return await procedures.stop_aircooled_primary_variable();
}

async function stop_watercooled_primary_variable_1c1pv_system() {
  console.log("Stopping watercooled primary variable 1C:1PV system...");
  return await procedures.stop_watercooled_primary_variable();
}

async function stop_aircooled_primary_variable_indv_system() {
  console.log("Stopping aircooled primary variable indv system...");
  return await procedures.stop_aircooled_primary_variable_indv();
}

async function stop_watercooled_primary_variable_indv_system() {
  console.log("Stopping watercooled primary variable indv system...");
  return await procedures.stop_watercooled_primary_variable_indv();
}

async function stop_watercooled_primary_secondary_2_stations() {
  console.log("Stopping watercooled primary secondary 2 stations...");
  return await procedures.stop_watercooled_primary_secondary_2_stations();
}


module.exports = {
  stop_aircooled_primary_variable_system,
  stop_aircooled_primary_secondary_system,
  stop_watercooled_primary_variable_system,
  stop_watercooled_primary_variable_type2_system,
  stop_watercooled_primary_secondary_system,
  stop_aircooled_primary_variable_1c1pv_system,
  stop_watercooled_primary_variable_1c1pv_system,
  stop_aircooled_primary_variable_indv_system,
  stop_watercooled_primary_variable_indv_system,
  stop_watercooled_primary_secondary_2_stations
};
