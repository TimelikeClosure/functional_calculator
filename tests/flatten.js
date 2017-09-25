"use strict";
const flow = require("lodash/fp/flow");
const entries = require("lodash/fp/entries");
const map = require("lodash/fp/map");
const flatten = require("lodash/fp/flatten");
const isTest = require("./utils").isTest;

function flattenTests(tests){
    return flow([
        entries,
        map(entryValue),
        map(recurseFlattenTests),
        flatten
    ])(tests);

    function recurseFlattenTests(object){
        if (isTest(object)){
            return object;
        }
        return flattenTests(object);
    }
}

function entryValue(entry){
    return entry[1];
}

module.exports = flattenTests;
