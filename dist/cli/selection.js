"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planSelection = exports.languageSelection = exports.fileSelection = void 0;
const inquirer_1 = require("inquirer");
const language_1 = require("metacall-protocol/language");
const plan_1 = require("metacall-protocol/plan");
const fileSelection = (message, files = []) => (0, inquirer_1.prompt)([
    {
        type: 'checkbox',
        name: 'scripts',
        message,
        choices: files
    }
]).then(res => res.scripts);
exports.fileSelection = fileSelection;
const languageSelection = (languages = []) => (0, inquirer_1.prompt)([
    {
        type: 'checkbox',
        name: 'langs',
        message: 'Select languages to run on Metacall',
        choices: languages.map(lang => language_1.Languages[lang].displayName)
    }
]).then(res => res.langs.map(lang => language_1.DisplayNameToLanguageId[lang]));
exports.languageSelection = languageSelection;
const planSelection = (message) => (0, inquirer_1.prompt)([
    {
        type: 'list',
        name: 'plan',
        message,
        choices: Object.keys(plan_1.Plans)
    }
]).then(res => res.plan);
exports.planSelection = planSelection;
