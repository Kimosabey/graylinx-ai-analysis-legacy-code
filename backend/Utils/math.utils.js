function roundVal(value, decimals = 2) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(decimals));
}

module.exports = { roundVal };
