const path = require("path");
const fs = require("fs");

const eqp_filename = path.join(
  __dirname,
  "../",
  process.env.PROJECT_EQP_DETAILS
);

function get_eqp_details() {
  const eqp_details = fs.readFileSync(eqp_filename, "utf8");
  return JSON.parse(eqp_details);
}

module.exports = {
  get_eqp_details,
};
