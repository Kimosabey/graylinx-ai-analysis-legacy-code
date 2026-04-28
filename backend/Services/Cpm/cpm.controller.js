const { OK } = require("http-status");
const controls = require("../../control_module/controls");

const THRESHOLD_SECONDS = 15 * 60; // 900 seconds

function buildConditionStatus(elapsed_seconds) {
  return {
    condition_met: elapsed_seconds > 0,
    elapsed_seconds,
    threshold_seconds: THRESHOLD_SECONDS,
    elapsed_minutes: parseFloat((elapsed_seconds / 60).toFixed(2)),
    threshold_minutes: 15,
    progress_percent: parseFloat(
      Math.min((elapsed_seconds / THRESHOLD_SECONDS) * 100, 100).toFixed(1)
    ),
  };
}

const getCpmStatus = (req, res) => {
  const durations = controls.cpm_execution_check_point.duration_seconds;

  const add_elapsed = durations.wc_chiller_add_condition_duration ?? 0;
  const remove_elapsed = durations.wc_chiller_remove_condition_duration ?? 0;

  res.status(OK).json({
    cpm_state: controls.cpm_state,
    step_status: controls.cpm_step_status,
    chiller_add_condition: buildConditionStatus(add_elapsed),
    chiller_remove_condition: buildConditionStatus(remove_elapsed),
    replace_devices: {
      tripped_devices: controls.cpm_replace_status.tripped_devices,
      replace_log: controls.cpm_replace_status.replace_log,
    },
  });
};

module.exports = { getCpmStatus };
