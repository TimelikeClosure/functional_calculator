"use strict";
if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    var _ = _ || require("lodash/fp");
    module.exports = {
        calculate: calculate
    };
}

function calculate(input){
    return _.flow([
        _.reduce(removeLeadingZeros)([""]),
        _.reduce(combineDigits)([""])
    ])(input);
}

function removeLeadingZeros(prev, curr){
    return `${_.last(prev)}` !== "0" || isNaN(curr)
    ? [...prev, curr]
    : [
        ...(_.dropRight(1)(prev)),
        curr
    ];
}

function combineDigits(prev, curr){
    return isNaN(curr) || isNaN(prev)
    ? [...prev, curr]
    : [
        ...(_.dropRight(1)(prev)),
        _.last(prev) + curr
    ];
}
