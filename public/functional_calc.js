"use strict";
if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    var _ = _ || require("lodash/fp");
    module.exports = {
        reduce: inputsToOperations,
        calculate: calculate
    };
}

function calculate(inputs){
    return _.flow([
        inputsToOperations,
        evaluateOperations
    ])(inputs);
}

function inputsToOperations(inputs){
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
    })([])(inputs);
}

function operandPairReduce(curr){
    return (
        isDecimal(curr)
        ? decimalReduce
        : isNumber(curr)
        ? numberReduce
        : nonOperandReduce
    );

    function decimalReduce(prev){
        return (
            _.isUndefined(prev)
            ? [`0${curr}`]
            : !isNumber(prev)
            ? [prev, `0${curr}`]
            : hasDecimal(prev)
            ? [prev]
            : [prev + curr]
        );
    }
    
    function numberReduce(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : !isNumber(prev)
            ? [prev, curr]
            : `${prev}` === "0"
            ? [curr]
            : [prev + curr]
        );
    }

    function nonOperandReduce(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : isNumber(prev)
            ? [removeOperandTail(prev), curr]
            : [prev, curr]
        );
    }
}

function operatorReduce(inputs){
    return _.reduce(function(prev, curr){
        return [
            ...(_.dropRight(1)(prev)),
            ...(operatorPairReduce(curr)(_.last(prev)))
        ];
    })([])(inputs);
}

function operatorPairReduce(curr){
    return (
        isBinaryOp(curr)
        ? binaryOperatorReduce
        : isUnaryOp(curr)
        ? unaryOperatorReduce
        : nonOperatorReduce
    );

    function binaryOperatorReduce(prev){
        return (
            _.isUndefined(prev)
            ? ["0", curr]
            : isBinaryOp(prev)
            ? [curr]
            : [prev, curr]
        );
    }

    function unaryOperatorReduce(prev){
        return (
            _.isUndefined(prev)
            ? ["0", curr]
            : [prev, curr]
        );
    }

    function nonOperatorReduce(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : [prev, curr]
        );
    }
}

function removeOperandTail(operand){
    return _.flow([
        Number,
        String
    ])(operand);
}

function evaluateOperations(operations){
    return operations;
}

function isDecimal(operation){
    return operation.length === 1 && hasDecimal(operation);
}

function hasDecimal(operation){
    return /\./.test(operation);
}

function isNumber(input){
    return !isNaN(input);
}

function isBinaryOp(input){
    return _.includes(input)(["+", "-", "*", "/"]);
}

function isUnaryOp(input){
    return _.includes(input)([]);
}
