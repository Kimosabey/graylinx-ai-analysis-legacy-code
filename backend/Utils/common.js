const toFixed = (number, to) => {
  return parseFloat(number.toFixed(to));
};

const validateDBQueryResultLength = (result, callback, minRows=1, maxRows=-1) => {
  if (Array.isArray(result) && result.length >= minRows) {
    let goodLength = (maxRows === -1) ? true : result.length <= parseInt(maxRows);
    if (goodLength === true)
      callback(null, result);
    else
      callback(new Error(`Invalid_DB_Results_Length: ${result.length}`))
  } else {
    callback(new Error('Invalid_DB_Results_Length'))
  }
}

const printDate = ()=>{let mytime = new Date(); return `${mytime.toLocaleDateString()} ${mytime.toLocaleTimeString()}`;}

module.exports = {
  toFixed,
  validateDBQueryResultLength,
  printDate
};
