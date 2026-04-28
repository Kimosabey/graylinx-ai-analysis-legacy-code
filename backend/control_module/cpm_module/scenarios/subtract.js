const procedures = require("../procedures");

async function substract_aircooled_primary_variable_scenario() {
  console.log("Executing substract aircooled primary variable...");
  return await procedures.substract_aircooled_primary_variable();
}

async function substract_aircooled_primary_secondary_scenario() {
  console.log("Executing substract aircooled primary secondary...");
  return await procedures.substract_aircooled_primary_secondary();
}

async function substract_watercooled_primary_secondary_scenario() {
  console.log("Executing substract watercooled primary secondary...");
  return await procedures.substract_watercooled_primary_secondary();
}

async function substract_watercooled_primary_variable_scenario() {
  try {
    console.log("Executing substract watercooled primary variable...");
    await procedures.substract_watercooled_primary_variable();
    return true;
  } catch (error) {
    console.error(
      "Error executing substract watercooled primary variable:",
      error
    );
    return false;
  }
}

async function substract_watercooled_primary_variable_type2_scenario() {
  console.log("Executing substract watercooled primary variable type 2...");
  return await procedures.substract_watercooled_primary_variable_type2();
}

async function substract_aircooled_primary_variable_1c1pv_scenario() {
  console.log("Executing substract aircooled primary variable 1C:1PV...");
  return await procedures.substract_aircooled_primary_variable_1c1pv();
}

async function substract_watercooled_primary_variable_1c1pv_scenario() {
  console.log("Executing substract watercooled primary variable 1C:1PV...");
  return await procedures.substract_watercooled_primary_variable_1c1pv();
}

async function substract_aircooled_primary_variable_indv_scenario() {
  console.log("Executing substract aircooled primary variable indv...");
  return await procedures.substract_aircooled_primary_variable();
}

async function substract_watercooled_primary_variable_indv_scenario() {
  console.log("Executing substract watercooled primary variable indv...");
  return await procedures.substract_watercooled_primary_variable();
}

module.exports = {
  substract_aircooled_primary_variable_scenario,
  substract_aircooled_primary_secondary_scenario,
  substract_watercooled_primary_secondary_scenario,
  substract_watercooled_primary_variable_scenario,
  substract_watercooled_primary_variable_type2_scenario,
  substract_aircooled_primary_variable_1c1pv_scenario,
  substract_watercooled_primary_variable_1c1pv_scenario,
  substract_aircooled_primary_variable_indv_scenario,
  substract_watercooled_primary_variable_indv_scenario,
};
