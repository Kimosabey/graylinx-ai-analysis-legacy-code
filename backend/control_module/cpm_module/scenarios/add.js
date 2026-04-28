const procedures = require("../procedures");

async function add_aircooled_primary_variable_scenario() {
  console.log("Executing add aircooled primary variable...");
  return await procedures.add_aircooled_primary_variable();
  
}

async function add_aircooled_primary_secondary_scenario() {
  console.log("Executing add aircooled primary secondary...");
  return await procedures.add_aircooled_primary_secondary();
}

async function add_watercooled_primary_secondary_scenario() {
  console.log("Executing add watercooled primary secondary...");
  return await procedures.add_watercooled_primary_secondary();
}

async function add_watercooled_primary_variable_type2_scenario() {
  console.log("Executing add watercooled primary variable type 2...");
  return await procedures.add_watercooled_primary_variable_type2();
}

async function add_watercooled_primary_variable_scenario() {
  try {
    console.log("Executing add watercooled primary variable...");
    await procedures.add_watercooled_primary_variable();
    return true;
  } catch (error) {
    console.error("Error executing add watercooled primary variable:", error);
    return false;
  }
}

async function add_aircooled_primary_variable_1c1pv_scenario() {
  console.log("Executing add aircooled primary variable 1C:1PV...");
  return await procedures.add_aircooled_primary_variable_1c1pv();
}

async function add_watercooled_primary_variable_1c1pv_scenario() {
  console.log("Executing add watercooled primary variable 1C:1PV...");
  return await procedures.add_watercooled_primary_variable_1c1pv();
}

async function add_aircooled_primary_variable_indv_scenario() {
  console.log("Executing add aircooled primary variable indv...");
  return await procedures.add_aircooled_primary_variable();
}

async function add_watercooled_primary_variable_indv_scenario() {
  console.log("Executing add watercooled primary variable indv...");
  return await procedures.add_watercooled_primary_variable();
}

module.exports = {
  add_aircooled_primary_variable_scenario,
  add_aircooled_primary_secondary_scenario,
  add_watercooled_primary_secondary_scenario,
  add_watercooled_primary_variable_type2_scenario,
  add_watercooled_primary_variable_scenario,
  add_aircooled_primary_variable_1c1pv_scenario,
  add_watercooled_primary_variable_1c1pv_scenario,
  add_aircooled_primary_variable_indv_scenario,
  add_watercooled_primary_variable_indv_scenario,
};
