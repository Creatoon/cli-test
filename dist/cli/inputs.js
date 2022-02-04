"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskedInput = exports.input = void 0;
const inquirer_1 = require("inquirer");
const input = (message) => (0, inquirer_1.prompt)([
    {
        type: 'input',
        name: 'data',
        message
    }
]).then(res => res.data);
exports.input = input;
const maskedInput = (message) => (0, inquirer_1.prompt)([
    {
        type: 'password',
        name: 'data',
        message,
        mask: '*'
    }
]).then(res => res.data);
exports.maskedInput = maskedInput;
