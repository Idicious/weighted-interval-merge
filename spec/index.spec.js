const merge = require("../dist/weighted-interval-merge");
const testData = require("./data/test-cases");

describe("Tests the merging of intervals to a flat array.", () => {
  // There is a list of testcases with input and expected output in testData, all cases should be covered.
  testData.forEach(({ test, input, expected }) => {
    it(test, () => {
      console.log(test);
      const actual = merge.weightedIntervalMerge(input);
      expect(actual).toEqual(expected);
    });
  });
});
