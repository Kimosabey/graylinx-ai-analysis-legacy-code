const actions = require("./actions");

(async () => {
  const active_devices = await actions.get_active_devices();

  console.log("Active devices:", active_devices);
})();
