"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const cloneExtend = require("./utils").cloneExtend;
const assign = require("lodash/fp/assign");

function runTests(testFunction){
    return flow([
        map(testOutputMap),
        map(testStatusMap)
    ]);

    function testOutputMap(test){
        return flow([
            testFunction,
            cloneExtend(test)("output")
        ])(test.input);
    }
}

function testStatusMap(test){
    return flow([
        testStatus(test.expected),
        cloneExtend(test)("status")
    ])(test.output);
}

function testStatus(expectedOutput){
    return function(actualOutput){
        return (
            actualOutput === expectedOutput
            ? "PASS"
            : "FAIL"
        );
    }
}

module.exports = runTests;