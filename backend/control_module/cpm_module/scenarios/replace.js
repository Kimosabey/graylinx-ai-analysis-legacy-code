const procedures = require("../procedures");

async function replace_aircooled_primary_variable_scenario() {
  console.log("Executing replace aircooled primary variable...");
  return await procedures.replace_aircooled_primary_variable();
}

async function replace_aircooled_primary_secondary_scenario() {
  console.log("Executing replace aircooled primary secondary...");
  return await procedures.replace_aircooled_primary_secondary();
}

async function replace_watercooled_primary_variable_type2_scenario() {
  console.log("Executing replace watercooled primary variable type 2...");
  return await procedures.replace_watercooled_primary_variable_type2();
}

async function replace_watercooled_primary_variable_scenario() {
  console.log("Executing replace watercooled primary variable...");
  return await procedures.replace_watercooled_primary_variable();
}

async function replace_watercooled_primary_secondary_scenario() {
  console.log("Executing replace watercooled primary secondary...");
  return await procedures.replace_watercooled_primary_secondary();
}

async function replace_cooling_tower_scenario() {
  console.log("Executing cooling tower replacement scenario...");
  return await procedures.replace_cooling_tower();
}

module.exports = {
  replace_aircooled_primary_variable_scenario,
  replace_aircooled_primary_secondary_scenario,
  replace_watercooled_primary_variable_type2_scenario,
  replace_watercooled_primary_variable_scenario,
  replace_watercooled_primary_secondary_scenario,
  replace_cooling_tower_scenario,
};
