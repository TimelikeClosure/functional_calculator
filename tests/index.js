"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const calculate = require("../public/index").calculate;
const tests = require('./tests.json');
const flattenTests = require('./flatten');
const runTests = require("./run");
const formatOutput = require("./formats").simple;
const outputTestResults = require("./output");

const testResults = flow([
    flattenTests,
    runTests(calculate),
    map(formatOutput),
    outputTestResults(console.log)
])(tests);
