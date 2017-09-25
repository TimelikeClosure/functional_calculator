"use strict";
const flow = require("lodash/fp/flow");
const assign = require("lodash/fp/assign");

function isTest(object){
    return object.hasOwnProperty("input") && object.hasOwnProperty("expected");
}

function cloneExtend(originalObject){
    return function(newKey){
        return function(newValue){
            return flow([
                assign({[newKey]: newValue}),
                assign(originalObject)
            ])({});
        }
    }
}

module.exports = {
    isTest: isTest,
    cloneExtend: cloneExtend
};
