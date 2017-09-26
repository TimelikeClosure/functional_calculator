"use strict";
if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    var _ = _ || require("lodash/fp");
    module.exports = {
        calculate: calculate
    };
}

function calculate(inputs){
    return _.flow([
        operandReduce,
        operatorReduce
    ])(inputs);
}

function operandReduce(inputs){
    return _.reduce(function(prev, curr){
        return [
            ...(_.dropRight(1)(prev)),
            ...(operandPairReduce(curr)(_.last(prev)))
        ];
    })(["0"])(inputs);
}

function operandPairReduce(curr){
    return (
        isDecimal(curr)
        ? decimalReduce
        : isNumber(curr)
        ? numberReduce
        : nonOperandReduce
    );

    function isDecimal(curr){
        return curr.length === 1 && hasDecimal(curr);
    }

    function decimalReduce(prev){
        return !isNumber(prev)
        ? [prev, `0${curr}`]
        : hasDecimal(prev)
        ? [prev]
        : [prev + curr]
    }
    
    function hasDecimal(operation){
        return /\./.test(operation);
    }

    function isNumber(curr){
        return !isNaN(curr);
    }

    function numberReduce(prev){
        return `${prev}` === "0"
        ? [curr]
        : [prev + curr];
    }

    function nonOperandReduce(prev){
        return [prev, curr];
    }
}

function operatorReduce(input){
    return input;
}

