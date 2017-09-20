"use strict";
const log = require("../public/index").log;
const tests = require('./tests.json');
const flattenTests = require('./flatten');

const flatTests = flattenTests(tests);

console.log(flatTests);
