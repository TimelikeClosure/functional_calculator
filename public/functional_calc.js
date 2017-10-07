"use strict";
if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    var _ = _ || require("lodash/fp");
    module.exports = {
        calculate: calculate
    };
}

function calculate(inputs){
    return _.flow([
        emptyInputsReducer,
        _.reduce(inputsReducer)([])
    ])(inputs);
}

function inputsReducer(acc, curr){
    return (
        isOperand(curr)
        ? operandReducer(curr)(acc)
        : isOperator(curr)
        ? operatorReducer(curr)(acc)
        : isGroupBoundary(curr)
        ? groupBoundaryReducer(curr)(acc)
        : isEvaluate(curr)
        ? evaluateReducer(curr)(acc)
        : [...acc, curr]
    );
}

function removeImpliedOpsMap(input){
    return (
        _.isArray(input)
        ? _.first(input)
        : input
    );
}

function reduceInputsLastPair(reducer){
    return function(inputs){
        return [
            ...(_.dropRight(2)(inputs)),
            ...reducer(_.last(inputs))(_.last(_.dropRight(1)(inputs)))
        ];
    };
}

function operandReducer(curr){
    return function(acc){
        return reduceInputsLastPair(operandInputPairReducer)([...acc, curr]);
    }
}

function operandInputPairReducer(curr){
    return (
        isDecimal(curr)
        ? decimalInputPairReducer
        : isNumber(curr)
        ? numberInputPairReducer
        : defaultOperandInputPairReducer
    );

    function decimalInputPairReducer(prev){
        return (
            _.isUndefined(prev)
            ? [`0${curr}`]
            : isImpliedOperation(prev)
            ? [`0${curr}`]
            : inputHas(isDecimal)(prev)
            ? [prev]
            : isOperand(prev)
            ? [prev + curr]
            : isGroupEnd(prev)
            ? [prev, "*", `0${curr}`]
            : [prev, `0${curr}`]
        );
    }

    function numberInputPairReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : isImpliedOperation(prev)
            ? [curr]
            : isPositiveZero(prev)
            ? [curr]
            : isNegativeZero(prev)
            ? [`-${curr}`]
            : isOperand(prev)
            ? (
                inputHas(isDecimal)(prev)
                ? [prev + inputReject(isDecimal)(curr)]
                : [prev + curr]
            )
            : isGroupEnd(prev)
            ? [prev, "*", curr]
            : [prev, curr]
        );
    }

    function defaultOperandInputPairReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : [prev, curr]
        );
    }
}

function operatorReducer(curr){
    return function(prev){
        return reduceInputsLastPair(operatorInputPairReducer)([...prev, curr]);
    }
}

function operatorInputPairReducer(curr){
    return (
        // isUnaryOp(curr)
        // ? unaryOperatorInputPairReducer
        isBinaryOp(curr)
        ? binaryOperatorInputPairReducer
        : defaultOperatorInputPairReducer
    );

    function binaryOperatorInputPairReducer(prev){
        return (
            _.isUndefined(prev)
            ? [...calculate([]), curr]
            : isOperand(prev)
            ? [removeOperandTail(prev), curr]
            : isImpliedOperation(prev)
            ? [removeImpliedOpsMap(prev), curr]
            : isGroupStart(prev)
            ? [prev, ...calculate([]), curr]
            : isBinaryOp(prev)
            ? [curr]
            : [prev, curr]
        );
    }

    function unaryOperatorInputPairReducer(prev){
        return (
            _.isUndefined(prev)
            ? [...calculate([]), curr]
            : [prev, curr]
        );
    }

    function defaultOperatorInputPairReducer(prev){
        return (
            _.isUndefined(prev)
            ? [curr]
            : [prev, curr]
        );
    }
}

function groupBoundaryReducer(curr){
    return (
        isGroupStart(curr)
        ? groupStartReducer
        : isGroupEnd(curr)
        ? groupEndReducer
        : defaultGroupReducer
    );

    function groupStartReducer(acc){
        return reduceInputsLastPair(groupStartInputPairReducer)([...acc, curr])
    }

    function groupStartInputPairReducer(curr){
        return function(prev){
            return (
                _.isUndefined(prev)
                ? [curr]
                : isOperand(prev)
                ? [prev, "*", curr]
                : isGroupEnd(prev)
                ? [prev, "*", curr]
                : [prev, curr]
            );
        }
    }

    function groupEndReducer(acc){
        return (
            groupDepth(acc) === 0
            ? reduceInputsLastPair(groupEndInputPairReducer)(["(", ...acc, curr])
            : reduceInputsLastPair(groupEndInputPairReducer)([...acc, curr])
        );
    }

    function groupEndInputPairReducer(curr){
        return function(prev){
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
    }

    function defaultGroupReducer(acc){
        return [...acc, curr];
    }
}

function evaluateReducer(curr){
    return function(acc){
        return [[
            ...evaluateExpression(groupCeilingReducer(_.flatten(acc))),
            ...repeatOperation(_.flatten(acc))
        ]];
    };
}

function groupCeilingReducer(inputs){
    return [
        ...inputs,
        ...((new Array(groupDepth(inputs))).fill(")"))
    ];
}

function emptyInputsReducer(inputs){
    return (
        _.isEmpty(inputs)
        ? ["0"]
        : inputs
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

function repeatOperation(inputs){
    const lastInput = _.last(inputs);
    const secondLastInput = _.last(_.dropRight(1)(inputs));
    return (
        isOperand(lastInput) && isBinaryOp(secondLastInput)
        ? [secondLastInput, lastInput]
        : []
    );
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

function isDecimal(input){
    return _.includes(input)(["."]);
}

function inputHas(test){
    return function(input){
        return _.some(test)(input);
    };
}

function inputReject(test){
    return function(input){
        return _.flow([
            _.reject(test),
            _.join("")
        ])(input);
    };
}

function isOperand(input){
    return isNumber(input) || isDecimal(input);
}

function isNumber(input){
    return !isNaN(input);
}

function isZero(input){
    return isPositiveZero(input) || isNegativeZero(input);
}

function isPositiveZero(input){
    return _.includes(input)(['0']);
}

function isNegativeZero(input){
    return _.includes(input)(['-0']);
}

function isOperator(input){
    return isUnaryOp(input) || isBinaryOp(input);
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

function isImpliedOperation(input){
    return _.isArray(input);
}
