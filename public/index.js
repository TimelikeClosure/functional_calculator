"use strict";

const log = function log(message){
    console.log(message);
}

if (!(this.hasOwnProperty('Window') && this instanceof Window) && module){
    module.exports = {
        log: log
    };
}