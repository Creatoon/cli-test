"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printLanguage = exports.error = exports.warn = exports.info = void 0;
const chalk_1 = __importDefault(require("chalk"));
const language_1 = require("metacall-protocol/language");
const info = (message) => {
    // eslint-disable-next-line no-console
    console.log(chalk_1.default.cyanBright.bold('i') + ' ' + chalk_1.default.cyan(message));
};
exports.info = info;
const warn = (message) => {
    // eslint-disable-next-line no-console
    console.warn(chalk_1.default.yellowBright.bold('!') + ' ' + chalk_1.default.yellow(message));
};
exports.warn = warn;
const error = (message) => {
    // eslint-disable-next-line no-console
    console.error(chalk_1.default.redBright.bold('X') + ' ' + chalk_1.default.red(message));
    return process.exit(1);
};
exports.error = error;
const printLanguage = (language) => chalk_1.default
    .hex(language_1.Languages[language].hexColor)
    .bold(language_1.Languages[language].displayName);
exports.printLanguage = printLanguage;
