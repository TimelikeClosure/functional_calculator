"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const mapTestIds = require("./map_ids");
const flattenTests = require('./flatten');
const propToCmds = require('./convert').propToCmds;
const propToOutput = require('./convert').propToOutput;
const runTests = require("./run");
const formatOutput = require("./formats").simple;
const outputTestMessages = require("./output");

let unit;
let tests;

console.log("\n===== REDUCTION TESTS =====\n");

unit = require("../public/functional_calc").reduce;
tests = require('./reductions.json');
unitTests(unit)(tests);

console.log("\n===== EVALUATION TESTS =====\n");

unit = require("../public/functional_calc").calculate;
tests = require('./evaluations.json');
unitTests(unit)(tests);

function unitTests(func){
    return flow([
        mapTestIds(),
        flattenTests,
        map(propToCmds("input")),
        map(propToOutput("expected")),
        runTests(func),
        map(formatOutput),
        outputTestMessages(console.info)(console.error)
    ]);
}
