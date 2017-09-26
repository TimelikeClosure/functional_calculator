"use strict";
if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    var _ = _ || require("lodash/fp");
    module.exports = {
        calculate: calculate
    };
}

function calculate(input){
    return _.flow([
        operandReduce,
        operatorReduce
    ])(input);
}

function operandReduce(input){
    return _.reduce(function(prev, curr){
        return [
            ...(_.dropRight(1)(prev)),
            ...(operandPairReduce(_.last(prev), curr))
        ];
    })(["0"])(input);
}

function operandPairReduce(prev, curr){
    return curr === "."
    ? (
        isNaN(prev)
        ? [prev, `0${curr}`]
        : /\./.test(prev)
        ? [prev]
        : [prev + curr]
    )
    : isNaN(curr)
    ? [prev, curr]
    : `${prev}` === "0"
    ? [curr]
    : [prev + curr];
}

function operatorReduce(input){
    return input;
}

