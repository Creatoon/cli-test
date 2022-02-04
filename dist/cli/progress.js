"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gauge_1 = __importDefault(require("gauge"));
exports.default = () => {
    const gauge = new gauge_1.default();
    return {
        progress: (text, bytes) => gauge.show(text, bytes),
        pulse: name => gauge.pulse(name)
    };
};
