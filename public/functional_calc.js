"use strict";
if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    var _ = _ || require("lodash/fp");
    module.exports = {
        reduce: inputsReducer,
        calculate: calculate
    };
}

function calculate(inputs){
    return _.flow([
        inputsReducer,
        operationsEvaluator
    ])(inputs);
}

function inputsReducer(inputs){
    return _.flow([
        reduceInputs(operandReducer),
        reduceInputs(operatorReducer),
        reduceInputs(groupReducer),
        groupBalancer,
        emptyReducer
    ])(inputs);
}

function reduceInputs(reducer){
    return _.reduce(function(prev, curr){
        return [
            ...(_.dropRight(1)(prev)),
            ...(reducer(curr)(_.last(prev)))
        ];
    })([]);
}

function operandReducer(curr){
    return (
        isDecimal(curr)
        ? decimalReducer
        : isNumber(curr)
        ? numberReducer
        : nonOperandReducer
    );

    function decimalReducer(prev){
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

    function numberReducer(prev){
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

    function nonOperandReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : isNumber(prev)
            ? [removeOperandTail(prev), curr]
            : [prev, curr]
        );
    }
}

function operatorReducer(curr){
    return (
        isBinaryOp(curr)
        ? binaryOperatorReducer
        : isUnaryOp(curr)
        ? unaryOperatorReducer
        : nonOperatorReducer
    );

    function binaryOperatorReducer(prev){
        return (
            _.isUndefined(prev)
            ? ["0", curr]
            : isGroupStart(prev)
            ? [prev, "0", curr]
            : isBinaryOp(prev)
            ? [curr]
            : [prev, curr]
        );
    }

    function unaryOperatorReducer(prev){
        return (
            _.isUndefined(prev)
            ? ["0", curr]
            : [prev, curr]
        );
    }

    function nonOperatorReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : [prev, curr]
        );
    }
}

function groupReducer(curr){
    return (
        isGroupStart(curr)
        ? groupStartReducer
        : isGroupEnd(curr)
        ? groupEndReducer
        : isOperand(curr)
        ? operandReducer
        : nonGroupReducer
    );

    function groupStartReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : isOperand(prev) || isGroupEnd(prev)
            ? [prev, "*", curr]
            : [prev, curr]
        );
    }

    function groupEndReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : isGroupStart(prev)
            ? [prev, "0", curr]
            : isBinaryOp(prev)
            ? [prev, "0", curr]
            : [prev, curr]
        );
    }

    function operandReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : isGroupEnd(prev)
            ? [prev, "*", curr]
            : [prev, curr]
        );
    }

    function nonGroupReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : [prev, curr]
        );
    }
}

function groupBalancer(inputs){
    return inputs;
}

function emptyReducer(inputs){
    return (
        _.size(inputs)
        ? inputs
        : ["0"]
    );
}

function removeOperandTail(operand){
    return _.flow([
        Number,
        String
    ])(operand);
}

function operationsEvaluator(operations){
    return operations;
}

function isDecimal(operation){
    return operation.length === 1 && hasDecimal(operation);
}

function hasDecimal(operation){
    return /\./.test(operation);
}

function isOperand(input){
    return isNumber(input);
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

function isGroupStart(input){
    return _.includes(input)(["("]);
}

function isGroupEnd(input){
    return _.includes(input)([")"]);
}
