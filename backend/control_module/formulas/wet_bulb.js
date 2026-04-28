async function calculate_wet_bulb(ambient, humidity) {
  if (!ambient || !humidity) {
    console.log(
      `Not all values are provided for to perform wet bulb temp calculation, ambient: ${ambient} and humidity: ${humidity}`,
    );
    return false;
  }
  const T = ambient;
  const RH = humidity;

  return (wet_bulb_temperature =
    T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035);
}

// calculate_wet_bulb(18,55).then(temp => console.log(temp))

module.exports = {
  calculate_wet_bulb,
};
