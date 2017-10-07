"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const reduce = require("lodash/fp/reduce");
const cloneExtend = require("./utils").cloneExtend;
const assign = require("lodash/fp/assign");
const isEqual = require("lodash/fp/isEqual");
const isEmpty = require("lodash/fp/isEmpty");

function runTests(testFunction){
    return flow([
        map(testOutputMap),
        map(testStatusMap)
    ]);

    function testOutputMap(test){
        return flow([
            (
                isEmpty(test.input)
                ? testFunction
                : reduce(function(acc, curr){
                    return testFunction([...acc, curr]);
                })([])
            ),
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