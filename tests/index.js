"use strict";
const flow = require("lodash/fp/flow");
const calculate = require("../public/index").calculate;
const tests = require('./tests.json');
const flattenTests = require('./flatten');
const runTests = require("./run");

const testResults = flow([
    flattenTests,
    runTests(calculate)
])(tests);

console.log(testResults);
