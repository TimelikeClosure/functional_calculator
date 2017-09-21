"use strict";
const flow = require("lodash/fp/flow");

function simple({input, expected, output, status}){
    return message(status)(input)(expected)(output);

    function message(status){
        return function(input){
            return function(expected){
                return (
                    status === "PASS"
                    ? passMessage
                    : failMessage
                );
                
                function passMessage(output){
                    return `${status}\n\tInput: "${input}"`;
                }
                
                function failMessage(output){
                    return `${status}\n\tInput: "${input}"\n\tExpected output: "${expected}"\n\tActual output: "${output}"`;
                }
            }
        }
    }
}

module.exports = {
    simple: simple
};
