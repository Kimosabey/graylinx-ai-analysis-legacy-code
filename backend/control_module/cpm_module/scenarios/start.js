const procedures = require("../procedures");

async function start_aircooled_primary_variable_system() {
  console.log("Starting aircooled primary variable system...");
  return await procedures.start_aircooled_primary_variable();

}

async function start_aircooled_primary_secondary_system() {
  console.log("Starting aircooled primary secondary system...");
  return await procedures.start_aircooled_primary_secondary();
}

async function start_watercooled_primary_variable_system() {
  try {
    console.log("Starting watercooled primary variable system...");
    await procedures.start_watercooled_primary_variable();
    return true;
  } catch (error) {
    console.error("Error starting watercooled primary variable system:", error);
    return false;
  }
}

async function start_watercooled_primary_secondary_system() {
  console.log("Starting watercooled primary secondary system...");
  return await procedures.start_watercooled_primary_secondary();
}

async function start_watercooled_primary_variable_type2_system() {
  console.log("Starting watercooled primary variable type 2 system...");
  return await procedures.start_watercooled_primary_variable_type2();
}

async function start_aircooled_primary_variable_1c1pv_system() {
  console.log("Starting aircooled primary variable 1C:1PV system...");
  return await procedures.start_aircooled_primary_variable();
}

async function start_watercooled_primary_variable_1c1pv_system() {
  console.log("Starting watercooled primary variable 1C:1PV system...");
  return await procedures.start_watercooled_primary_variable();
}

async function start_aircooled_primary_variable_indv_system() {
  console.log("Starting aircooled primary variable indv system...");
  return await procedures.start_aircooled_primary_variable_indv();
}

async function start_watercooled_primary_variable_indv_system() {
  console.log("Starting watercooled primary variable indv system...");
  return await procedures.start_watercooled_primary_variable_indv();
}

async function start_watercooled_primary_secondary_stations_2_system() {
  console.log("Starting watercooled primary secondary 2 stations system...");
  return await procedures.start_watercooled_primary_secondary_stations_2();
}

module.exports = {
  start_aircooled_primary_variable_system,
  start_aircooled_primary_secondary_system,
  start_watercooled_primary_variable_system,
  start_watercooled_primary_secondary_system,
  start_watercooled_primary_variable_type2_system,
  start_aircooled_primary_variable_1c1pv_system,
  start_watercooled_primary_variable_1c1pv_system,
  start_aircooled_primary_variable_indv_system,
  start_watercooled_primary_variable_indv_system,
  start_watercooled_primary_secondary_stations_2_system
};
