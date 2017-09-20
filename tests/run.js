"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");
const assign = require("lodash/fp/assign");

function runTests(testFunction){
    return map(test => {
        return flow([
            assign(test),
            assign({result: testFunction(test.input)})
        ])({});
    })
}

module.exports = runTests;