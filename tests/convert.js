"use strict";
const cloneDeep = require("lodash/fp/cloneDeep");
const flow = require("lodash/fp/flow");
const split = require("lodash/fp/split");
const cloneExtend = require("./utils").cloneExtend;

function propToCmds(prop){
    return function(test){
        return flow([
            getCmds,
            cloneExtend(test)(prop)
        ])(test[prop]);
    };
}

function getCmds(stream){
    switch (typeof stream){
        case "string":
            return split("")(stream);
        default:
            return stream;
    }
}

function propToOutput(prop){
    return function(test){
        return flow([
            getOutput,
            cloneExtend(test)(prop)
        ])(test[prop]);
    };
}

function getOutput(stream){
    switch (typeof stream){
        case "string":
            return [stream];
        default:
            return stream;
    }
}

module.exports = {
    propToCmds: propToCmds,
    propToOutput: propToOutput
};
