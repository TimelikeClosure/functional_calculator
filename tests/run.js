"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const reduce = require("lodash/fp/reduce");
const cloneExtend = require("./utils").cloneExtend;
const assign = require("lodash/fp/assign");
const isEqual = require("lodash/fp/isEqual");

function runTests(testFunction){
    return flow([
        map(testOutputMap),
        map(testStatusMap)
    ]);

    function testOutputMap(test){
        return flow([
            reduce(function(acc, curr){
                return testFunction([...acc, curr]);
            })(testFunction([])),
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
            isEqual(expectedOutput)(actualOutput)
            ? "PASS"
            : "FAIL"
        );
    }
}

module.exports = runTests;