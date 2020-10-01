function main({ temp }) {
  return { temp: (temp * 9) / 5 + 32 };
}

module.exports = main;
