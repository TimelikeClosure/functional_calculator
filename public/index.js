"use strict";
const _ = require('lodash/fp');

const calculate = function calculate(inputString){
    return inputString;
}

if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    module.exports = {
        calculate: calculate
    };
}