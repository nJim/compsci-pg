const convertCtoF = require("./convertCtoF");

test("convert freezing point of water", () => {
  expect(convertCtoF({ temp: 0 })).toBe({ temp: 32 });
});

test("convert boiling point of water", () => {
  expect(convertCtoF({ temp: 100 })).toBe({ temp: 212 });
});

test("convert point where scales converge", () => {
  expect(convertCtoF({ temp: -40 })).toBe({ temp: -40 });
});
