"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const utils_1 = require("../utils");
describe('unit opt', () => {
    it('Should call a function with the provided string', () => {
        (0, assert_1.ok)((0, utils_1.opt)(x => x, 'hello') === 'hello');
    });
    it('Should return empty string when second argument is null', () => {
        (0, assert_1.ok)((0, utils_1.opt)(x => x, null) === '');
    });
});
