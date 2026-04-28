const chalk = require("chalk");
const Table = require("cli-table3");

function logToConsole({ timestamp, level, title, data }, textMode = false) {
  const colors = {
    info: chalk.cyan,
    success: chalk.green,
    warn: chalk.yellow,
    error: chalk.red,
  };

  const color = colors[level] || chalk.white;
  const time = chalk.gray(new Date(timestamp).toLocaleTimeString());

  if (textMode) {
    console.log(`${time} ${color(title)}`);
    return;
  }

  console.log(color.bold(`\n▶ ${title}`));
  console.log(chalk.gray(`  ${timestamp}`));

  if (data && typeof data === "object" && Object.keys(data).length) {
    const table = new Table({
      colWidths: [25, 60],
      wordWrap: true,
    });

    Object.entries(data).forEach(([key, value]) => {
      table.push([
        key,
        typeof value === "string" ? value : JSON.stringify(value, null, 2),
      ]);
    });

    console.log(table.toString());
  }
}

module.exports = {
  logToConsole,
};
