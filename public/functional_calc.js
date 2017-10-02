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
        reduceInputsByPairs(operandReducer),
        reduceInputsByPairs(operatorReducer),
        reduceInputsByPairs(groupReducer),
        groupBalancer,
        emptyReducer
    ])(inputs);
}

function reduceInputsByPairs(reducer){
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
            : `${prev}` === "0"
            ? [curr]
            : isNumber(prev) && hasDecimal(prev)
            ? [prev + _.flow([
                _.split("."),
                _.join("")
            ])(curr)]
            : isNumber(prev)
            ? [prev + curr]
            : [prev, curr]
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
    return _.flow([
        groupByDelimiters(["="]),
        _.reduce((prev, curr) => (
            _.isArray(curr)
            ? [...prev, groupFloorReducer(curr)]
            : isEvaluate(curr)
            ? [
                ...(_.dropRight(1)(prev)),
                groupCeilingReducer(_.last(prev)),
                curr
            ]
            : [...prev, curr]
        ))([]),
        _.flatten
    ])(inputs);
}

function groupByDelimiters(delimiters){
    return _.reduce(function(prev, curr){
        return (
            _.includes(curr)(delimiters)
            ? [
                ..._.cloneDeep(prev),
                curr,
                []
            ]
            : [
                ...(_.dropRight(1)(_.cloneDeep(prev))),
                [
                    ...(_.last(prev)),
                    curr
                ]
            ]
        );
    })([[]]);
}

function groupFloorReducer(inputs){
    return _.reduce((prev, curr) => (
        curr === ")" && groupDepth(prev) === 0
        ? ["(", ...prev, curr]
        : [...prev, curr]
    ))([])(inputs);
}

function groupCeilingReducer(inputs){
    return [
        ...inputs,
        ...((new Array(groupDepth(inputs))).fill(")"))
    ];
}

function emptyReducer(inputs){
    return (
        _.size(inputs)
        ? inputs
        : ["0"]
    );
}

function groupDepth(inputs){
    return (_.countBy(isGroupStart)(inputs)[true] || 0) - (_.countBy(isGroupEnd)(inputs)[true] || 0);
}

function removeOperandTail(operand){
    return _.flow([
        Number,
        String
    ])(operand);
}

function operationsEvaluator(operations){
    return _.reduce(function(prev, curr){
        return (
            isEvaluate(curr)
            ? [...evaluateExpression(prev)]
            : [...prev, curr]
        );
    })([])(operations);
}

function evaluateExpression(expression){
    return (
        expression.length === 0
        ? ["0"]
        : expression.length === 1
        ? expression
        : evaluateSubExpression(expression)
    );
}

function evaluateSubExpression(expression){
    return evaluateExpression(
        expressionHasOpType(isGroupBoundary)(expression)
        ? evaluateSubGroup(expression)
        : expressionHasOpType(isMultDivOp)(expression)
        ? evaluateSubOpType(isMultDivOp)(expression)
        : expressionHasOpType(isAddSubOp)(expression)
        ? evaluateSubOpType(isAddSubOp)(expression)
        : [NaN]
    );
}

function evaluateSubGroup(expression){
    const groupEndIndex = _.findIndex(isGroupEnd)(expression);
    const groupStartIndex = _.findLastIndex(isGroupStart)(
        _.slice(0)(groupEndIndex)(expression)
    );
    return [
        ...(_.slice(0)(groupStartIndex)(expression)),
        ...evaluateExpression(_.slice(groupStartIndex+1)(groupEndIndex)(expression)),
        ...(_.slice(groupEndIndex+1)(expression.length)(expression))
    ];
}

function expressionHasOpType(opTest){
    return function(expression){
        return _.findIndex(opTest)(expression) !== -1;
    };
}

function evaluateSubOpType(opTest){
    return function(expression){
        const opIndex = _.findIndex(opTest)(expression);
        const op = expression[opIndex];
        return (
            isBinaryOp(op)
            ? [
                ...(_.slice(0)(opIndex - 1)(expression)),
                evaluateSingleOperation(op)(expression[opIndex - 1])(expression[opIndex + 1]),
                ...(_.slice(opIndex + 2)(expression.length)(expression))
            ]
            : expression
        );
    }
}

function evaluateSingleOperation(operator){
    return (
        isBinaryOp(operator)
        ? evaluateSingleBinaryOperation
        : evaluateSingleUnaryOperation
    );

    function evaluateSingleBinaryOperation(operand1){
        return function(operand2 = operand1){
            return String(
                isAddition(operator)
                ? Number(operand1) + Number(operand2)
                : isSubtraction(operator)
                ? Number(operand1) - Number(operand2)
                : isMultiplication(operator)
                ? Number(operand1) * Number(operand2)
                : isDivision(operator)
                ? Number(operand1) / Number(operand2)
                : NaN
            );
        };
    }

    function evaluateSingleUnaryOperation(operand){
        return (
            NaN
        );
    }
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
    return isAddSubOp(input) || isMultDivOp(input);
}

function isUnaryOp(input){
    return _.includes(input)([]);
}

function isAddSubOp(input){
    return isAddition(input) || isSubtraction(input);
}

function isAddition(input){
    return _.includes(input)(["+"]);
}

function isSubtraction(input){
    return _.includes(input)(["-"]);
}

function isMultDivOp(input){
    return isMultiplication(input) || isDivision(input);
}

function isMultiplication(input){
    return _.includes(input)(["*"]);
}

function isDivision(input){
    return _.includes(input)(["/"]);
}

function isGroupBoundary(input){
    return isGroupStart(input) || isGroupEnd(input);
}

function isGroupStart(input){
    return _.includes(input)(["("]);
}

function isGroupEnd(input){
    return _.includes(input)([")"]);
}

function isEvaluate(input){
    return _.includes(input)(["="]);
}
