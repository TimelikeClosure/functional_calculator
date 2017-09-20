"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
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

function cloneExtend(originalObject){
    return function(newKey){
        return function(newValue){
            return flow([
                assign(originalObject),
                assign({[newKey]: newValue})
            ])({});
        }
    }
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