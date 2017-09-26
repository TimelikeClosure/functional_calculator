"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const calculate = require("../public/functional_calc").calculate;
const tests = require('./tests.json');
const mapTestIds = require("./map_ids");
const flattenTests = require('./flatten');
const propToCmds = require('./convert').propToCmds;
const propToOutput = require('./convert').propToOutput;
const runTests = require("./run");
const formatOutput = require("./formats").simple;
const outputTestMessages = require("./output");

const testResults = flow([
    mapTestIds(),
    flattenTests,
    map(propToCmds("input")),
    map(propToOutput("expected")),
    runTests(calculate),
    map(formatOutput),
    outputTestMessages(console.info)(console.error)
])(tests);
