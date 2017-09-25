"use strict";
const flow = require("lodash/fp/flow");
const map = require("lodash/fp/map");

function outputMessages(stdOut){
    return function (stdErr){
        return function(messages){
            return map(stdOut)(messages);
        }
    }
}

module.exports = outputMessages;
