"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");

function outputTestResults(stdOut){
    return function(messages){
        return map(stdOut)(messages);
    }
}

module.exports = outputTestResults;
