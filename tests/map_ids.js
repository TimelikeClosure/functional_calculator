"use strict";
const flow = require("lodash/fp/flow");
const toPairs = require("lodash/fp/toPairs");
const fromPairs = require("lodash/fp/fromPairs");
const map = require("lodash/fp/map");
const slice = require("lodash/fp/slice");
const isTest = require("./utils").isTest;
const cloneExtend = require("./utils").cloneExtend;

function mapTestIds(path = ""){
    return function(tests){
        return flow([
            toPairs,
            flow([
                pathMap,
                map
            ])(path),
            map(extendTestWithPath),
            fromPairs
        ])(tests);
    }
}

function pathMap(basePath){
    return function(testPair){
        return [...testPair, `${basePath}/${testPair[0]}`];
    }
}

function extendTestWithPath(testTriplet){
    return [
        testTriplet[0],
        isTest(testTriplet[1]) 
        ? cloneExtend(testTriplet[1])("id")(testTriplet[2]) 
        : mapTestIds(testTriplet[2])(testTriplet[1])
    ];
}

module.exports = mapTestIds;
