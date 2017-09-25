"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const calculate = require("../public/index").calculate;
const tests = require('./tests.json');
const mapTestIds = require("./map_ids");
const flattenTests = require('./flatten');
const propToCmds = require('./convert').propToCmds;
const runTests = require("./run");
const formatOutput = require("./formats").simple;
const outputTestMessages = require("./output");

const testResults = flow([
    mapTestIds(),
    flattenTests,
    map(propToCmds("input")),
    runTests(calculate),
    map(formatOutput),
    outputTestMessages(console.info)(console.error)
])(tests);
