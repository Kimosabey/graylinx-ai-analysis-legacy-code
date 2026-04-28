const { withSteps } = require("../withSteps");

const {
  start_aircooled_primary_variable_with_steps,
  start_aircooled_primary_secondary_with_steps,
  start_watercooled_primary_variable_with_steps,
  start_watercooled_primary_fixed_with_steps,
  start_watercooled_primary_secondary_with_steps,
  start_watercooled_primary_variable_type2_with_steps,
  start_aircooled_primary_variable_indv_with_steps,
  start_watercooled_primary_variable_indv_with_steps,
  start_watercooled_primary_secondary_2_station_with_steps
} = require("./start");

const {
  stop_aircooled_primary_variable_with_steps,
  stop_aircooled_primary_secondary_with_steps,
  stop_watercooled_primary_variable_with_steps,
  stop_watercooled_primary_fixed_with_steps,
  stop_watercooled_primary_variable_type2,
  stop_watercooled_primary_secondary,
  stop_aircooled_primary_variable_indv_with_steps,
  stop_watercooled_primary_variable_indv_with_steps,
  stop_watercooled_primary_secondary_2_stations
} = require("./stop");

const {
  add_aircooled_primary_variable_with_steps,
  add_aircooled_primary_secondary_with_steps,
  add_watercooled_primary_secondary_with_steps,
  add_watercooled_primary_variable_with_steps,
  add_watercooled_primary_variable_type2_with_steps,
  add_aircooled_primary_variable_1c1pv_with_steps,
  add_watercooled_primary_variable_1c1pv_with_steps,
} = require("./add");

const {
  substract_aircooled_primary_variable_with_steps,
  substract_aircooled_primary_secondary_with_steps,
  substract_watercooled_primary_secondary_with_steps,
  substract_watercooled_primary_variable_with_steps,
  substract_watercooled_primary_variable_type2_with_steps,
  substract_aircooled_primary_variable_1c1pv_with_steps,
  substract_watercooled_primary_variable_1c1pv_with_steps,
} = require("./subtract");

const {
  replace_primary_pump_with_steps,
  replace_secondary_pump_with_steps,
  replace_condensor_pump_with_steps,
  replace_cooling_tower_with_steps,
  replace_aircooled_primary_variable_with_steps,
  replace_aircooled_primary_secondary_with_steps,
  replace_watercooled_primary_variable_type2_with_steps,
  replace_watercooled_primary_with_steps,
  replace_watercooled_primary_secondary_with_steps,
} = require("./replace");

module.exports = {
  start_aircooled_primary_variable: withSteps(
    start_aircooled_primary_variable_with_steps,
  ),
  start_aircooled_primary_secondary: withSteps(
    start_aircooled_primary_secondary_with_steps,
  ),
  start_watercooled_primary_variable: withSteps(
    start_watercooled_primary_variable_with_steps,
  ),
    start_watercooled_primary_fixed: withSteps(
    start_watercooled_primary_fixed_with_steps,
  ),
  start_watercooled_primary_secondary: withSteps(
    start_watercooled_primary_secondary_with_steps,
  ),
  start_watercooled_primary_variable_type2: withSteps(
    start_watercooled_primary_variable_type2_with_steps,
  ),
  start_aircooled_primary_variable_indv: withSteps(
    start_aircooled_primary_variable_indv_with_steps,
  ),
  start_watercooled_primary_variable_indv: withSteps(
    start_watercooled_primary_variable_indv_with_steps,
  ),
  start_watercooled_primary_secondary_stations_2: withSteps(
    start_watercooled_primary_secondary_2_station_with_steps
  ),
  stop_aircooled_primary_variable: withSteps(
    stop_aircooled_primary_variable_with_steps,
  ),
  stop_aircooled_primary_secondary: withSteps(
    stop_aircooled_primary_secondary_with_steps,
  ),
  stop_watercooled_primary_variable: withSteps(
    stop_watercooled_primary_variable_with_steps,
  ),
   stop_watercooled_primary_fixed: withSteps(
    stop_watercooled_primary_fixed_with_steps,
  ),
  stop_watercooled_primary_variable_type2: withSteps(
    stop_watercooled_primary_variable_type2,
  ),
  stop_watercooled_primary_secondary: withSteps(
    stop_watercooled_primary_secondary,
  ),
  stop_aircooled_primary_variable_indv: withSteps(
    stop_aircooled_primary_variable_indv_with_steps,
  ),
  stop_watercooled_primary_variable_indv: withSteps(
    stop_watercooled_primary_variable_indv_with_steps,
  ),
  stop_watercooled_primary_secondary_2_stations: withSteps(
    stop_watercooled_primary_secondary_2_stations
  ),

  add_aircooled_primary_variable: withSteps(
    add_aircooled_primary_variable_with_steps,
  ),
  add_aircooled_primary_secondary: withSteps(
    add_aircooled_primary_secondary_with_steps,
  ),
  add_watercooled_primary_secondary: withSteps(
    add_watercooled_primary_secondary_with_steps,
  ),
  add_watercooled_primary_variable_type2: withSteps(
    add_watercooled_primary_variable_type2_with_steps,
  ),
  add_watercooled_primary_variable: withSteps(
    add_watercooled_primary_variable_with_steps,
  ),
  add_aircooled_primary_variable_1c1pv: withSteps(
    add_aircooled_primary_variable_1c1pv_with_steps,
  ),
  add_watercooled_primary_variable_1c1pv: withSteps(
    add_watercooled_primary_variable_1c1pv_with_steps,
  ),

  replace_aircooled_primary_variable: withSteps(
    replace_aircooled_primary_variable_with_steps,
  ),
  replace_aircooled_primary_secondary: withSteps(
    replace_aircooled_primary_secondary_with_steps,
  ),
  replace_watercooled_primary_variable_type2: withSteps(
    replace_watercooled_primary_variable_type2_with_steps,
  ),
  replace_watercooled_primary_variable: withSteps(
    replace_watercooled_primary_with_steps,
  ),
  replace_watercooled_primary_secondary: withSteps(
    replace_watercooled_primary_secondary_with_steps,
  ),

  substract_aircooled_primary_variable: withSteps(
    substract_aircooled_primary_variable_with_steps,
  ),
  substract_aircooled_primary_secondary: withSteps(
    substract_aircooled_primary_secondary_with_steps,
  ),
  substract_watercooled_primary_secondary: withSteps(
    substract_watercooled_primary_secondary_with_steps,
  ),
  substract_watercooled_primary_variable: withSteps(
    substract_watercooled_primary_variable_with_steps,
  ),
  substract_watercooled_primary_variable_type2: withSteps(
    substract_watercooled_primary_variable_type2_with_steps,
  ),
  substract_aircooled_primary_variable_1c1pv: withSteps(
    substract_aircooled_primary_variable_1c1pv_with_steps,
  ),
  substract_watercooled_primary_variable_1c1pv: withSteps(
    substract_watercooled_primary_variable_1c1pv_with_steps,
  ),

  replace_primary_pump: withSteps(replace_primary_pump_with_steps),
  replace_secondary_pump: withSteps(replace_secondary_pump_with_steps),
  replace_condensor_pump: withSteps(replace_condensor_pump_with_steps),
  replace_cooling_tower: withSteps(replace_cooling_tower_with_steps),
};
