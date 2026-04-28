const { log } = require("../../customLogger/logger");
const controls = require("../controls");

function getISTTimestamp() {
  return new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
    .toISOString()
    .replace("Z", "+05:30");
}


// decorator to add step logging to procedure functions
function withSteps(fn, name) {
  name = name || fn.name || "anonymous";

  return async function(...args) {
    log("info", `[${name}] Status`, { state: "IN PROGRESS" });
    controls.cpm_step_status.step = name;
    controls.cpm_step_status.sub_step = null;
    controls.cpm_step_status.updated_at = getISTTimestamp();

    try {
      const ctx = {
        async step(label, action) {
          controls.cpm_step_status.sub_step = label;
          const snap = this.snapshot || null;
          const replacingId =
            this.replaceChillerId ||
            this.replacePrimPumpId ||
            this.replaceSecPumpId ||
            this.replaceCondPumpId ||
            this.replaceCoolingTowerId ||
            null;
          controls.cpm_step_status.current_device = {
            chiller: controls.getDeviceNameById(snap, this.chillerId),
            cooling_tower: controls.getDeviceNameById(snap, this.coolingTowerId),
            pri_pump: controls.getDeviceNameById(snap, this.priPumpId || this.pumpId),
            cond_pump: controls.getDeviceNameById(snap, this.condenserPumpId),
            prim_var_pump: controls.getDeviceNameById(snap, this.primVarPumpId),
            replacing: controls.getDeviceNameById(snap, replacingId),
          };
          controls.cpm_step_status.updated_at = getISTTimestamp();
          log("info", `Step ${label} Started`, {
            function: name,
            step: label,
          });

          try {
            const success = await action();

            if (!success) {
              log("error", `Step ${label} Failed`, {
                function: name,
                step: label,
                reason: "Action returned false",
              });
              throw new Error(label);
            }

            log("success", `Step ${label} Completed`, {
              function: name,
              step: label,
            });

            return success;
          } catch (err) {
            log("error", `Step ${label} Error`, {
              function: name,
              step: label,
              error: err.message,
            });
            throw err;
          }
        },
      };

      const result = await fn.apply(ctx, args);

      log("success", `[${name}] Status`, { state: "COMPLETED" });
      controls.cpm_step_status.sub_step = null;
      controls.cpm_step_status.current_device = null;
      controls.cpm_step_status.updated_at = getISTTimestamp();
      return result;
    } catch (err) {
      log("error", `[${name}] Status`, {
        state: "FAILED",
        error: err.message,
      });
      controls.cpm_step_status.sub_step = null;
      controls.cpm_step_status.current_device = null;
      controls.cpm_step_status.updated_at = getISTTimestamp();
      return false;
    }
  };
}

module.exports = {
  withSteps,
};
